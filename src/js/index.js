// [V] Step1: DOM 조작과 이벤트 핸들링으로 메뉴 관리하기
// [ ] Step2: localStorage 상태 관리로 메뉴 관리하기
// [ ] localStorage에 데이터를 저장하여 새로고침해도 데이터가 남아있게 한다.
// [ ] 에스프레소, 프라푸치노, 블렌디드, 티바나, 디저트 각각의 종류별로 메뉴판을 관리할 수 있게 만든다.
// [ ] 페이지에 최초로 접근할 때는 에스프레소 메뉴가 먼저 보이게 한다.
// [ ] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.

const $ = (selector) => document.querySelector(selector)

const form = $("#espresso-menu-form")
const input = $("#espresso-menu-name")
const list = $("#espresso-menu-list")
const cnt = $(".menu-count")

function updateTotal() {
  const num = list.querySelectorAll("li").length
  cnt.innerText = `총 ${num}개`
}

const createHTML = (name) => `
				<span class="w-100 pl-2 menu-name">${name}</span>
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

function addMenu() {
  const name = input.value
  if (!name) return

  const item = document.createElement("li")
  item.className = "menu-list-item d-flex items-center py-2"
  item.innerHTML = createHTML(name)

  list.appendChild(item)

  updateTotal()

  input.value = ""
}

function updateMenu(e) {
  const span = e.target.closest("li").querySelector("span")
  const ret = prompt("메뉴명을 수정하세요", span.innerHTML)
  if (ret === null) return
  span.innerHTML = ret
}

function removeMenu(e) {
  const li = e.target.closest("li")
  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return
  li.remove()
  updateTotal()
}

function App() {
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
    if (e.target.classList.contains("data-remove")) {
      removeMenu(e)
    }
  })
}

App()
