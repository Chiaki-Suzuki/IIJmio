Vue.createApp({
  setup() {
    /*-------------------------
      加算額
    -------------------------*/
    // 質問2 SIMカード/eSIM
    const simCard = 410
    const useEsim = 850
    // 質問3 通話定額5分/10分/かけ放題/利用なし
    const min5 = 90
    const min10 = 290
    const infinite = 990
    const none = 0
    // 質問4 SMS利用あり
    const usesSms = 820
    // 質問5 データeSIM利用あり/なし
    const dataEsim = 440
    const noDataEsim = 740

    /*-------------------------
      回答内容保持用
    -------------------------*/
    let checkedAns = Vue.reactive({
      q1: { a0: false, a1: false },
      q2: { a0: false, a1: false },
      q3: { a0: false, a1: false, a2: false, a3: false },
      q4: { a0: false, a1: false },
      q5: { a0: false, a1: false },
      q6: { a0: false, a1: false, a2: false, a3: false, a4: false },
    })

    /*-------------------------
      各質問の変化値を保持しておく
    -------------------------*/
    let keepChangeValue = {
      q1: {price: 0, ans: ''},
      q2: {price: 0, ans: ''},
      q3: {price: 0, ans: ''},
      q4: {price: 0, ans: ''},
      q5: {price: 0, ans: ''}
    }

    // 質問表示切替
    let state = Vue.ref(1)

    /*-------------------------
      質問1
    -------------------------*/
    const q1 = (ans) => {
      checkedAns.q1 = { a0: false, a1: false }
      if (ans === 0) {
        commonAction(2, 'q1', 'a0')
        brunchAction(['q4', 'q5'], 'q1', ans )
      } else if (ans === 1) {
        commonAction(4, 'q1', 'a1')
        brunchAction(['q2', 'q3'], 'q1', ans )
      }
    }
    /*-------------------------
      質問2
    -------------------------*/
    let q2AddPrice = 0
    const q2 = (ans) => {
      addAction('q2', ans)
      checkedAns.q2 = { a0: false, a1: false }
      if (ans === simCard) {
        commonAction(3, 'q2', 'a0')
      } else {
        commonAction(3, 'q2', 'a1')
      }
    }
    /*-------------------------
      質問3
    -------------------------*/
    const q3 = (ans) => {
      addAction('q3', ans, 3)
      checkedAns.q3 = { a0: false, a1: false, a2: false, a3: false }
      if (ans === min5) {
        commonAction(6, 'q3', 'a0')
      } else if (ans === min10) {
        commonAction(6, 'q3', 'a1')
      } else if (ans === infinite) {
        commonAction(6, 'q3', 'a2')
      } else if (ans === none) {
        commonAction(6, 'q3', 'a3')
      }
    }
    /*-------------------------
      質問4
    -------------------------*/
    const q4 = (ans) => {
      checkedAns.q4 = { a0: false, a1: false }
      if (ans === 0) {
        commonAction(6, 'q4', 'a0')
        brunchAction(['q2', 'q3', 'q5'], 'q4', ans )
        addAction('q4', usesSms, 4)
      } else if (ans === 1) {
        commonAction(5, 'q4', 'a1')
        // ギガ数選択後に選択肢を変更した場合
        if (result != null && result != 0) {
          total()
        }
      }
    }
    /*-------------------------
      質問5
    -------------------------*/
    const q5 = (ans) => {
      brunchAction(['q2', 'q3', 'q4'], 'q5', ans )
      addAction('q5', ans, 5)
      // checked用
      checkedAns.q5 = { a0: false, a1: false }
      if (ans === dataEsim) {
        commonAction(6, 'q5', 'a0')
      } else {
        commonAction(6, 'q5', 'a1')
      }
    }
    /*-------------------------
      質問6
    -------------------------*/
    let line = Vue.ref('-')
    let giga = Vue.ref('-')
    const q6 = (ans) => {
      trans.value = 'next'
      checkedAns.q6 = { a0: false, a1: false, a2: false, a3: false, a4: false }
      // 回線数表示用
      line.value = 1
      // ギガ数表示用
      giga.value = ans
      // ギガ数応じて加算額変更
      // 2G
      if (ans === 2) {
        gigaPrice = 0
        checkedAns.q6.a0 = true
      }
      // 4G
      else if (ans === 4) {
        gigaAdd(140, 150, 220, 160)
        checkedAns.q6.a1 = true
      }
      // 8G
      else if (ans === 8) {
        gigaAdd(650, 650, 660, 660)
        checkedAns.q6.a2 = true
      }
      // 15G
      else if (ans === 15) {
        gigaAdd(950, 960, 990, 990)
        checkedAns.q6.a3 = true
      }
      // 20G
      else if (ans === 20) {
        gigaAdd(1150, 1160, 1210, 1210)
        checkedAns.q6.a4 = true
      }
      // 合計金額
      total()
      // 診断結果までスクロール
      autoScroll()
      console.log(result);
    }
    // ギガ数による料金加算
    let gigaPrice = 0
    const gigaAdd = (esim, sim, sms, datasim) => {
      if (keepChangeValue.q1.ans === 0) {
        gigaPrice = kihonAdd(esim)
      } else if (keepChangeValue.q4.ans === 0) {
        gigaPrice = kihonAdd(sim)
      } else if (keepChangeValue.q5.ans === dataEsim) {
        gigaPrice = kihonAdd(sms)
      } else if (keepChangeValue.q5.ans === noDataEsim) {
        gigaPrice = kihonAdd(datasim)
      }
    }
    /*-------------------------
      関数まとめ
    -------------------------*/
    // 共通操作
    const commonAction = (nextState, qNum, aNum) => {
      trans.value = 'next'
      state.value = nextState
      checkedAns[qNum][aNum] = true
      console.log(result);
    }
    // 分岐する質問の場合
    const brunchAction = (array, qNum, answer) => {
      array.forEach((elem) => {
        keepChangeValue[elem].price = 0
      })
      keepChangeValue[qNum].ans = answer
    }
    // 料金を加算する質問の場合
    let prevState = Vue.ref('')
    const addAction = (qNum, answer, prev) => {
      keepChangeValue[qNum].price = kihonAdd(answer)
      prevState.value = prev
      if (result != null) {
        total()
      }
    }
    // 基本料金加算
    const kihonAdd = (qAdd) => {
      let addPrice = 0
      addPrice = qAdd
      return addPrice
    }
    // 合計金額算出
    let result = null
    let price = Vue.ref('-')
    const total = () => {
      totalAddPrice = Object.keys(keepChangeValue).reduce((sum, key) => {
        return sum + keepChangeValue[key].price
      }, 0)
      result = totalAddPrice + gigaPrice
      price.value = result.toLocaleString()
    }
    // スクロール
    const autoScroll = () => {
      setTimeout(() => {
        const resultBox = document.querySelector('.result_box')
        window.scrollTo(0, resultBox.scrollHeight)
      }, 300);
    }
    // 前の設問に戻る
    let trans = Vue.ref('next')
    const returnQuestion = (prev) => {
      trans.value = 'prev'
      state.value = prev
      // 最初の質問に戻った時はresultの値を0にする
      if (prev === 1) {
        result = 0
      }
    }

    return {
      // 質問表示切替
      state,
      trans,
      // 解答保持用
      checkedAns,
      // 最終的な結果
      line,
      giga,
      price,
      // 解答選択後の動き
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      // 加算金額
      // 質問2
      simCard,
      useEsim,
      // 質問3
      min5,
      min10,
      infinite,
      none,
      // 質問5
      dataEsim,
      noDataEsim,
      // 前の質問に戻る
      returnQuestion,
      prevState
    }
  }
}).mount('#app')
