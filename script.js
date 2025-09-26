const wrap = document.querySelector(".dice-user_wrap");

function App(userCount){
    wrap.innerHTML = "";

    const controlEl = {
        new: document.querySelector(".dice-controller_reset"),
        roll: document.querySelector(".dice-controller_roll"),
        hold: document.querySelector(".dice-controller_hold"),
        dice: document.querySelector(".dice-controller_dice"),
        diceDots: document.querySelectorAll(".dice-controller_dice .dot"),
    };

    /**
     * 0 1 2
     * 3 4 5
     * 6 7 8
     */
    const diceFace = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8],
    }

    const listeners = new AbortController();

    const store = {
        active: 1,
        playing: null,
        gameOver: false,
        players: new Map(),
        setCurrunt: function(val){
            if(this.gameOver) return;
            const player = this.players.get(this.active);
            controlEl.dice.classList.add('done');
            if(val < 3){
                player.current = 0;
                player.currentEl.textContent = player.current;
                return this.switchPlayer();
            };
            player.current += val;
            player.currentEl.textContent = player.current;
        },
        hold: function(){
            if(this.gameOver) return;
            const player = this.players.get(this.active);
            if(!player.current) return alert('주사위를 1회 이상 굴려주세요.');
            player.score += player.current;
            player.scoreEl.textContent = player.score;
            player.current = 0;
            player.currentEl.textContent = 0;
            this.switchPlayer();
            if(player.score >= 50) return this.done(player);
        },
        reset: function(){
            App(partiInput());
        },
        done: function(player){
            this.gameOver = true;
            window.alert(`${player.name} Win!`)
            if(window.confirm('다시 시작하시겠습니까?')) return this.reset();
        },
        rolling: function(){
            if(this.gameOver) return;
            if(this.playing) return alert('주사위를 굴리는 중입니다.');
            controlEl.dice.classList.remove('done');
            const rollingTime = 1500;
            const start = performance.now();
            const step = ()=>{
                controlEl.dice.classList.add('rolling');
                const elapsed = performance.now() - start;
                let randomNb = Math.floor(Math.random()*6) + 1;
                Array.apply(null, controlEl.diceDots).forEach((dot, idx)=>{
                    const chk = diceFace[randomNb].includes(idx);
                    if(chk) dot.classList.add('isActive');
                    else dot.classList.remove('isActive');
                })
                if(elapsed < rollingTime){
                    const t = elapsed / rollingTime;
                    const delay = 20 + t * t * 100;
                    return this.playing = setTimeout(step, delay);
                };
                this.playing = null;
                controlEl.dice.classList.remove('rolling');
                // this.setCurrunt(50);  테스트용으로 바로 끝내기
                this.setCurrunt(randomNb);
            };
            this.playing = setTimeout(step,0);
        },
        switchPlayer: function(){
            this.players.get(this.active).boxEl.classList.remove('isActive');
            this.active < this.players.size ? this.active++ : this.active = 1;
            this.players.get(this.active).boxEl.classList.add('isActive');
        }
    };

    for (let i=0;i<userCount;i++){
        const box = document.createElement("div");
        const idx = i + 1;
        box.className = "dice-user_box";
        box.innerHTML = `
            <span class="dice-user_name">PLAYER ${idx}</span>
            <div class="dice-user_score">
                <span>0</span>
            </div>
            <div class="dice-user_currunt--box">
                <span>CURRENT</span>
                <div class="dice-user_currunt--score">
                    <span>0</span>
                </div>
            </div>
        `;
        wrap.appendChild(box);

        const player = {
            name: box.querySelector('.dice-user_name').textContent,
            score: 0,
            current: 0,
            scoreEl: box.querySelector(".dice-user_score span"),
            currentEl: box.querySelector(".dice-user_currunt--score span"),
            boxEl: box,
        };
        store.players.set(idx, {...player});
        store.switchPlayer();
    };
    store.switchPlayer();

    const reset = ()=>store.reset();
    const rolling = ()=>store.rolling();
    const hold = ()=>store.hold();

    controlEl.new.addEventListener('click',reset);
    controlEl.roll.addEventListener('click',rolling);
    controlEl.hold.addEventListener('click',hold);
};

function partiInput(){
    const partiCount = window.prompt('참여 유저 수를 입력해주세요. 2~4', 2);
    if(partiCount >= 2 && partiCount <= 4){
        return partiCount;
    } else {
        alert('2~4 사이의 숫자를 입력해주세요.');
        return partiInput();
    };
};

App(partiInput());