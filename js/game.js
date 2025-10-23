const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");
const livesSpan = document.getElementById("lives");

// 원 객체 생성
let circle = {
    x : Math.random() * 350 + 25,
    y : 0,
    r : 30,
    speed : 2,
    color : getRandomColor()
};

// 점수 변수
let score = 0;
let lives = 3; // 목숨 변수 추가 (초기값 3)
let gameOver = false; // 게임 오버 상태 변수
let combo = 0; // 콤보 카운터 변수 추가
let scorePerClick = 1; // 클릭 당 점수 변수 추가

// 랜덤 색상 함수
function getRandomColor() {
    const colors = ["red", "blue", "green", "orange", "purple", "teal"];
    return colors[Math.floor(Math.random() * colors.length)]; // 랜덤 색상 반환
}

// 원 리셋 함수
function resetCircle() {
    circle.x = Math.random() * (canvas.width - 50) + 25;
    circle.y = 0;
    circle.color = getRandomColor(); // 랜덤 색상 할당
}

// 원 그리기 함수
function drawCircle() {
    ctx.beginPath(); // 그리기 시작
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2); // 원 그리기
    ctx.fillStyle = circle.color; //색 채우기
    ctx.fill(); // 원 채우기
    ctx.closePath(); // 그리기 종료
}

// 콤보 텍스트 그리기 함수 (새로 추가)
function drawCombo() {
    if (combo > 0) { // 콤보가 1 이상일 때만 표시
        ctx.font = "bold 120px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 반투명 검은색
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"; // 텍스트를 세로 중앙에 정렬
        ctx.fillText(combo, canvas.width / 2, canvas.height / 2);
    }
}

function updateGame() {
    // 게임 오버 상태일 때 실행
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // 반투명 검은색 배경
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2); // Game Over 텍스트 표시
        return; // 게임 루프 중단
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCombo(); // 콤보 텍스트를 먼저 그려서 원보다 뒤에 위치하게 함
    drawCircle();
    circle.y += circle.speed; // 원 이동

    // 공이 바닥에 닿았을 때
    if (circle.y - circle.r > canvas.height) {
        lives--; // 목숨 1 감소
        livesSpan.textContent = lives; // 화면에 목숨 업데이트

        /* --- [추천] 목숨 경고 CSS를 위한 JS 코드 --- */
        if (lives === 1) {
            livesSpan.classList.add("low-life"); // 목숨이 1개면 .low-life 클래스 추가
        } else {
            livesSpan.classList.remove("low-life"); // 1개가 아니면 제거
        }
        /* ------------------------------------------- */

        // --- 콤보 시스템 초기화 로직 (수정) ---
        combo = 0;
        scorePerClick = 1;
        circle.speed = 2; // 속도도 초기값으로 리셋

        resetCircle();

        // 목숨이 0이 되면 게임 오버 처리
        if (lives <= 0) {
            gameOver = true;
        }
    }

    requestAnimationFrame(updateGame);
}

// 원 클릭 이벤트 함수
canvas.addEventListener("click", function (e) {
    if (gameOver) return; // 게임 오버 상태에서는 클릭 비활성화

    const rect = canvas.getBoundingClientRect(); // 캔버스 크기 가져오기
    const mouseX = e.clientX - rect.left; // 마우스 x좌표
    const mouseY = e.clientY - rect.top; // 마우스 y좌표

    const dx = mouseX - circle.x; // x축 거리 계산
    const dy = mouseY - circle.y; // y축 거리 계산
    const distance = Math.sqrt(dx * dx + dy * dy); // 거리 계산

    // --- 위치 보정 로직 (수정된 부분) ---
    // 공의 속도에 비례하여 추가적인 판정 거리를 줍니다.
    // 숫자는 게임의 느낌에 맞게 조절할 수 있습니다. (1.5 ~ 2.5 사이 추천)
    const lagCompensation = circle.speed * 2;

    if (distance < circle.r + lagCompensation) {
        // 성공적으로 클릭 했을 때
        // --- 콤보 시스템 적용 로직 (수정) ---
        combo++; // 콤보 1 증가
        score += scorePerClick; // 콤보에 따라 증가된 점수 추가
        scoreSpan.textContent = score; // 점수 표시

        // 5 콤보 마다 보상 적용
        if (combo > 0 && combo % 5 === 0) {
            circle.speed += 0.5; // 원의 속도 증가
            scorePerClick++; // 클릭 당 점수 1 증가
        }

        resetCircle();
    }
});

livesSpan.textContent = lives;
updateGame();