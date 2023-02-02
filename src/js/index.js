// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기
// TODO 1. 메뉴 추가
// - [v] 메뉴 이름을 입력받고 확인 버튼을 누르면 메뉴를 추가한다.
// - [v] 메뉴 이름을 입력받고 엔터키 입력으로 메뉴를 추가한다.
// - [v] 메뉴가 추가되고 나면, input은 빈 값으로 초기화한다.
// - [v] 사용자 입력값이 빈 값이라면 추가되지 않는다.
// - [v] 추가되는 메뉴의 아래 마크업은 <ul id ="espresso-menu-list" class="mt-3 pl-0" ></ul> 안에 삽입해야 한다.

const form = document.querySelector("#espresso-menu-form")
const input = document.querySelector("#espresso-menu-name")
const button = document.querySelector("#espresso-menu-submit-button")
const list = document.querySelector("#espresso-menu-list")

function addMenu() {
  const menuName = input.value
  if (!menuName) return

  const menuItem = document.createElement("li")
  menuItem.class = "menu-list-item d-flex items-center py-2"

  menuItem.innerHTML = menuName

  list.appendChild(menuItem)

  input.value = ""
}

function App() {
  form.addEventListener("submit", (e) => {
    e.preventDefault()
  })
  button.addEventListener("click", () => {
    addMenu()
  })
  input.addEventListener("submit", (e) => {
    console.log("submit")
    e.preventDefault()
  })
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      addMenu()
    }
  })
}

App()

// TODO 2. 메뉴 수정
// - [ ] 메뉴의 수정 버튼 클릭 이벤트가 발생하면, 브라우저 prompt 인터페이스가 뜬다.
// - [ ] 메뉴 수정 시 prompt 인터페이스에 수정 메뉴명을 기입하고 확인 버튼을 누르면 메뉴 이름이 업데이트된다.
// TODO 3. 메뉴 삭제
// - [ ] 메뉴의 삭제 버튼을 누르면 브라우저 confirm 인터페이스가 뜬다.
// - [ ] 메뉴 삭제 시 confirm 인터페이스에 확인 버튼을 누르면 메뉴가 삭제된다.
// TODO 4. 기타
// - [ ] 총 메뉴 갯수를 count하여 상단에 보여준다.
