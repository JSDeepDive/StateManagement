// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기(v3)

const createItem = (name, key) => `
			<li class="menu-list-item d-flex items-center py-2">
				<span class="w-100 pl-2 menu-name">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button data-edit"
					data-index=${key}
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button data-remove"
					data-index=${key}
				>
					삭제
				</button>
			</li>
			`

const $ = (selector) => document.querySelector(selector)
const list = $("#espresso-menu-list")

let state = {
  menu: [
    "long black",
    "americano",
    "espresso con panna",
    "lattte",
    "cafe mocha",
    "cappucino",
  ],
}

let renderTimes = 0

const addMenu = () => {
  const { menu } = state
  const input = $("input")

  const name = input.value

  if (!name) return

  setState({ menu: [...menu, name] }) // setState 통해 메뉴 추가시 자동으로 DOM 요소 처리함

  input.value = ""
}

function updateMenu(e) {
  const { menu } = state

  const prevName = e.target.closest("li").querySelector("span").innerText
  const index = Number(e.target.dataset.index)

  const newName = prompt("메뉴명을 수정하세요", prevName)

  if (newName === null) return

  // setState 통해 메뉴 업데이트 시 자동으로 DOM 요소 처리함
  setState({
    menu: menu.map((name, idx) => {
      if (index === idx) return newName
      return name
    }),
  })
}

function removeMenu(e) {
  const { menu } = state

  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return

  const index = Number(e.target.dataset.index)

  // setState 통해 메뉴 삭제 시 자동으로 DOM 요소 처리함
  setState({
    menu: menu.filter((_, idx) => index !== idx),
  })
}

function updateTotal() {
  const { menu } = state
  const cnt = $(".menu-count")
  cnt.innerText = `총 ${menu.length}개`
}

function addEventHandler(e) {
  e.preventDefault()
  addMenu()
}

function updateRemoveEventHandler(e) {
  if (e.target.classList.contains("data-edit")) {
    updateMenu(e)
  }
  if (e.target.classList.contains("data-remove")) {
    removeMenu(e)
  }
}

const render = () => {
  console.log("[Render] Called!")
  renderTimes += 1

  const { menu } = state

  const form = $("form")
  const list = $("ul")

  list.innerHTML = `
		<ul id="espresso-menu-list" class="mt-3 pl-0">
			${menu.map((name, idx) => createItem(name, idx)).join("")}
		</ul>
	`
  // 메뉴 추가
  form.addEventListener("submit", addEventHandler)

  // 메뉴 수정/삭제
  list.addEventListener("click", updateRemoveEventHandler)

  updateTotal()
}

const setState = (newState) => {
  const prevState = state
  state = { ...state, ...newState }
  console.log(
    `[setState]: \n(prevState) ${JSON.stringify(
      prevState
    )} \n(currState) ${JSON.stringify(state)}`
  )
  render()
}

render()
