// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기

const form = document.querySelector("#espresso-menu-form")
const input = document.querySelector("#espresso-menu-name")
const button = document.querySelector("#espresso-menu-submit-button")
const list = document.querySelector("#espresso-menu-list")
const cnt = document.querySelector(".menu-count")
let nums = 0

// TODO 1. 메뉴 추가
// - [v] form 요소의 submit 이벤트로 addMenu 이벤트 핸들러 바인딩

function createElem(item, name) {
  const span = document.createElement("span")
  span.className = "w-100 pl-2 menu-name"
  span.innerHTML = name

  const edit = document.createElement("button")
  edit.type = "button"
  edit.className = "bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
  edit.innerHTML = "수정"
  edit.addEventListener("click", () => {
    updateMenu(span)
  })

  const remove = document.createElement("button")
  remove.type = "button"
  remove.className = "bg-gray-50 text-gray-500 text-sm menu-remove-button"
  remove.innerHTML = "삭제"
  remove.addEventListener("click", () => {
    removeMenu(item)
  })

  item.appendChild(span)
  item.appendChild(edit)
  item.appendChild(remove)
}

function updateTotal() {
  cnt.innerHTML = `총 ${nums}개`
}

function addMenu() {
  const name = input.value
  if (!name) return

  const item = document.createElement("li")
  item.className = "menu-list-item d-flex items-center py-2"

  createElem(item, name)

  list.appendChild(item)

  nums += 1
  updateTotal()

  input.value = ""
}

// TODO 2. 메뉴 수정/삭제
// - [ ] createElem 함수를 data-* 속성을 적용한 html 템플릿으로 대체.
// - [ ] 메뉴 수정과 삭제 이벤트 처리를 <ul> 요소에 위임.
function updateMenu(span) {
  const ret = prompt("메뉴명을 수정하세요", span.innerHTML)
  if (ret === null) return
  span.innerHTML = ret
}

function removeMenu(item) {
  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return
  list.removeChild(item)
  nums -= 1
  updateTotal()
}

function App() {
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    addMenu()
  })
  // button.addEventListener("click", () => {
  //   addMenu()
  // })
  // input.addEventListener("keyup", (e) => {
  //   if (e.key === "Enter") {
  //     addMenu()
  //   }
  // })
}

App()
