// [V] Step1: DOM 조작과 이벤트 핸들링으로 메뉴 관리하기
// [ ] Step2: localStorage 상태 관리로 메뉴 관리하기

// [v] localStorage에 데이터를 저장하여 새로고침해도 데이터가 남아있게 한다.
// [v] 페이지에 최초로 접근할 때는 에스프레소 메뉴가 먼저 보이게 한다.
// [v] 에스프레소, 프라푸치노, 블렌디드, 티바나, 디저트 각각의 종류별로 메뉴판을 관리할 수 있게 만든다.
// [v] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.

const ESPRESSO = "espresso"
const FRAPPUCINO = "frappuccino"
const BLENDED = "blended"
const TEAVANA = "teavana"
const DESSERT = "dessert"

const MENU = "menu"

const ACTIONS = {
  // CHANGE_TAB: "change-tab",
  ADD_MENU: "add-menu",
  UPDATE_MENU: "update-menu",
  TOGGLE_SOLDOUT: "toggle-soldOut",
  REMOVE_MENU: "remove-menu",
}

const initialState = {
  [ESPRESSO]: [],
  [FRAPPUCINO]: [],
  [BLENDED]: [],
  [TEAVANA]: [],
  [DESSERT]: [],
}

function getState() {
  return JSON.parse(localStorage.getItem(MENU))
}

function setState(state) {
  localStorage.setItem(MENU, JSON.stringify(state))
}

const hasSaved = localStorage.getItem(MENU)
if (!hasSaved) {
  setState(initialState)
}

let state = getState()

const $ = (selector) => document.querySelector(selector)

const nav = $("nav")

const form = $("#espresso-menu-form")
const input = $("#espresso-menu-name")
const list = $("#espresso-menu-list")
const cnt = $(".menu-count")

let tab = ESPRESSO

function updateState(action, payload) {
  switch (action) {
    // case ACTIONS.CHANGE_TAB:
    // 	break
    case ACTIONS.ADD_MENU:
      const newItem = payload
      state = {
        ...state,
        [tab]: [...state[tab], newItem],
      }
      break
    case ACTIONS.UPDATE_MENU:
      const { prevName, newName } = payload
      state = {
        ...state,
        [tab]: state[tab].map((item) => {
          if (item.name == prevName) {
            return { ...item, name: newName }
          }
          return item
        }),
      }
      break
    case ACTIONS.TOGGLE_SOLDOUT:
      const toggleName = payload
      state = {
        ...state,
        [tab]: state[tab].map((item) => {
          if (item.name === toggleName) {
            return { ...item, soldOut: !item.soldOut }
          }
          return item
        }),
      }
      break
    case ACTIONS.REMOVE_MENU:
      const removeName = payload
      state = {
        ...state,
        [tab]: state[tab].filter((item) => item.name !== removeName),
      }
      break
    default:
      break
  }
  setState(state)
}

function changeTab(e) {
  const category = e.target.dataset.categoryName
  if (category === tab) return

  tab = category
  console.log(tab)

  const main = $("main")
  const div = main.closest("div")

  main.remove()
  const newMain = document.createElement("main")
  newMain.className = "mt-10 d-flex justify-center"
  newMain.innerHTML = mainWrapperTemplate(tab)

  div.appendChild(newMain)
}

function updateTotal() {
  const num = list.querySelectorAll("li").length
  cnt.innerText = `총 ${num}개`
}

const createHTML = (name) => `
				<span class="w-100 pl-2 menu-name">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button data-soldOut"
				>
					품절
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button data-edit"
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button data-remove"
				>
					삭제
				</button>
			`

function createItem(name, soldOut = false) {
  const item = document.createElement("li")
  item.className = "menu-list-item d-flex items-center py-2"
  item.innerHTML = createHTML(name, soldOut)

  if (soldOut) {
    item.querySelector("span").classList.add("sold-out")
  }

  list.appendChild(item)

  updateTotal()
}

function addMenu() {
  const name = input.value
  if (!name) return

  createItem(name)
  updateState(ACTIONS.ADD_MENU, { name, soldOut: false })

  input.value = ""
}

function updateMenu(e) {
  const span = e.target.closest("li").querySelector("span")

  const ret = prompt("메뉴명을 수정하세요", span.innerHTML)

  if (ret === null) return

  updateState(ACTIONS.UPDATE_MENU, { prevName: span.innerHTML, newName: ret })
  span.innerHTML = ret
}

function toggleSoldOut(e) {
  const span = e.target.closest("li").querySelector("span")
  span.classList.toggle("sold-out")

  updateState(ACTIONS.TOGGLE_SOLDOUT, span.innerText)
}

function removeMenu(e) {
  const li = e.target.closest("li")

  const ret = confirm("정말 삭제하시겠습니까?")

  if (!ret) return

  li.remove()

  const span = li.querySelector("span")

  updateState(ACTIONS.REMOVE_MENU, span.innerText)

  updateTotal()
}

function render() {
  const menuItems = state[tab]
  menuItems.map(({ name, soldOut }) => createItem(name, soldOut))

  nav.addEventListener("click", (e) => {
    changeTab(e)
  })

  //  form 요소의 상위 submit 이벤트로 하위 요소의 click, keyup 이벤트 처리
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    addMenu()
  })

  // ul 요소에 수정/삭제 button 이벤트 위임
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("data-edit")) {
      updateMenu(e)
    }
    if (e.target.classList.contains("data-soldOut")) {
      toggleSoldOut(e)
    }
    if (e.target.classList.contains("data-remove")) {
      removeMenu(e)
    }
  })
}

// TODO 커링으로 구현하고싶은데...

const TABS = {
  [ESPRESSO]: [ESPRESSO, "에스프레소", "☕"],
  [FRAPPUCINO]: [FRAPPUCINO, "프라푸치노", "🥤"],
  [BLENDED]: [BLENDED, "블렌디드", "🍹"],
  [TEAVANA]: [TEAVANA, "티바나", "🫖 "],
  [DESSERT]: [DESSERT, "디저트", "🍰"],
}

const mapInfo = (tab) => TABS[tab]

const mainWrapperTemplate = (category) => {
  const [tab, tabName, emoji] = mapInfo(category)
  return `
    <div class="wrapper bg-white p-10">
      <div class="heading d-flex justify-between">
        <h2 class="mt-1">${emoji} ${tabName} 메뉴 관리</h2>
        <span class="mr-2 mt-4 menu-count">총 0개</span>
      </div>
      <form id="${tab}-menu-form">
        <div class="d-flex w-100">
          <label for="${tab}-menu-name" class="input-label" hidden>
            ${tabName} 메뉴 이름
          </label>
          <input
            type="text"
            id="${tab}-menu-name"
            name="${tab}MenuName"
            class="input-field"
            placeholder="${tabName} 메뉴 이름"
            autocomplete="off"
          />
          <button
            type="submit"
            name="submit"
            id="${tab}-menu-submit-button"
            class="input-submit bg-green-600 ml-2"
          >
            확인
          </button>
        </div>
      </form>
      <ul id="${tab}-menu-list" class="mt-3 pl-0"></ul>
    </div>
  `
}

function reRender() {}

render()
