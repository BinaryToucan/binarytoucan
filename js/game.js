(() => {
  "use strict";
  const N = 6, CELL = 100;
  const board = document.getElementById("board");
  //const remainingEl = document.getElementById("remaining");
  //const movesEl = document.getElementById("moves");
  //const levelEl = document.getElementById("level");
  const messageEl = document.getElementById("message");
  const palette = ["#70d6ff","#ffadad","#cdb4db","#bde0a8","#ffd166","#f4a261","#a0c4ff","#ffafcc","#9bf6ff"];
  let arrows = [], initial = [], moves = 0, level = 1, busy = false;

  const key = (x,y) => `${x},${y}`;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const shuffle = a => {
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };

  // Случайный гамильтонов путь: посещает каждую клетку ровно один раз.
  function makeHamiltonianPath() {
    const path = [{x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}];
    const used = new Set([key(path[0].x,path[0].y)]);
    function dfs() {
      if (path.length === N*N) return true;
      const p = path[path.length-1];
      const options = shuffle(dirs.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})))
        .filter(q=>q.x>=0&&q.x<N&&q.y>=0&&q.y<N&&!used.has(key(q.x,q.y)));
      // Предпочитаем клетки с меньшим числом дальнейших выходов.
      options.sort((a,b)=>degree(a,used)-degree(b,used));
      for (const q of options) {
        const k=key(q.x,q.y); used.add(k); path.push(q);
        if (dfs()) return true;
        path.pop(); used.delete(k);
      }
      return false;
    }
    function degree(p, visited) {
      return dirs.reduce((s,[dx,dy])=>s+((p.x+dx>=0&&p.x+dx<N&&p.y+dy>=0&&p.y+dy<N&&!visited.has(key(p.x+dx,p.y+dy)))?1:0),0);
    }
    return dfs() ? path : null;
  }

  function canLeave(arrow, others) {
    const occupied = new Set();
    for (const other of others) if (other.id !== arrow.id)
      for (const p of other.cells) occupied.add(key(p.x,p.y));
    const [dx,dy]=arrow.dir;
    // Проверяем вылет стрелочки.
    const p = arrow.cells[arrow.cells.length - 1];

    let x=p.x+dx, y=p.y+dy;
    while (x>=0&&x<N&&y>=0&&y<N) {
      if (occupied.has(key(x,y))) return false;
      x+=dx; y+=dy;
    }
    
    return true;
  }

  function isSolvable(list) {
    const memo = new Set();
    function solve(mask) {
      if (mask===0) return true;
      if (memo.has(mask)) return false;
      for (let i=0;i<list.length;i++) if (mask & (1<<i)) {
        const others=list.filter((_,j)=>j!==i&&(mask&(1<<j)));
        if (canLeave(list[i],others) && solve(mask & ~(1<<i))) return true;
      }
      memo.add(mask); return false;
    }
    return solve((1<<list.length)-1);
  }

  function generateLevel() {
    // Делим случайный путь на короткие непрерывные стрелки и отбрасываем тупиковые раскладки.
    for (let attempt=0;attempt<500;attempt++) {
      const path=makeHamiltonianPath();
      if (!path) continue;
      const pieces=[]; let at=0;
      while (at<path.length) {
        const left=path.length-at;
        let len;
        if (left<=5) len=left;
        else {
          const maxLen=Math.min(5,left-2); // не оставляем одиночную клетку в конце
          len=2+Math.floor(Math.random()*(maxLen-1));
        }
        pieces.push(path.slice(at,at+len)); at+=len;
      }
      const candidate=pieces.map((cells,i)=>{
        const a=cells[cells.length-2], b=cells[cells.length-1];
        return {id:i,cells,dir:[b.x-a.x,b.y-a.y],color:palette[i%palette.length]};
      });
      if (candidate.length<=20 && isSolvable(candidate)) return candidate;
    }
    // Надёжный запасной вариант: горизонтальные полосы, направленные наружу.
    const fallback=[];
    for(let y=0;y<N;y++) {
      const cells=Array.from({length:N},(_,x)=>({x:y%2===0?x:N-1-x,y}));
      fallback.push({id:y,cells,dir:[y%2===0?1:-1,0],color:palette[y]});
    }
    return fallback;
  }

  function drawGrid() {
    let s="";
    for(let i=1;i<N;i++) {
      const p=i*CELL;
      s+=`<line class="gridline" x1="${p}" y1="0" x2="${p}" y2="600"/>`;
      s+=`<line class="gridline" x1="0" y1="${p}" x2="600" y2="${p}"/>`;
    }
    board.innerHTML=s;
  }

  function arrowPath(cells) {
    return cells.map((p,i)=>`${i?"L":"M"} ${p.x*CELL+CELL/2} ${p.y*CELL+CELL/2}`).join(" ");
  }

  function headPoints(x,y,dx,dy,size) {
    const px=-dy, py=dx;
    const tipX=x+dx*size, tipY=y+dy*size;
    const backX=x-dx*size*0.72, backY=y-dy*size*0.72;
    const wing=size*0.78;
    return `${tipX},${tipY} ${backX+px*wing},${backY+py*wing} ${backX-px*wing},${backY-py*wing}`;
  }

  function render() {
    drawGrid();
    for (const a of arrows) {
      const group=document.createElementNS("http://www.w3.org/2000/svg","g");
      group.setAttribute("class","arrow");
      group.setAttribute("tabindex","0");
      group.setAttribute("role","button");
      group.setAttribute("aria-label",`arrow ${a.id+1}`);
      group.dataset.id=a.id;
      const d=arrowPath(a.cells);
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("class","main"); path.setAttribute("d",d);
      path.setAttribute("stroke",a.color);
      const hit=document.createElementNS("http://www.w3.org/2000/svg","path");
      hit.setAttribute("class","hit"); hit.setAttribute("d",d);
      const head=document.createElementNS("http://www.w3.org/2000/svg","polygon");
      head.setAttribute("class","head"); head.setAttribute("fill",a.color);
      const tip=a.cells[a.cells.length-1];
      head.setAttribute("points",headPoints(tip.x*CELL+CELL/2,tip.y*CELL+CELL/2,a.dir[0],a.dir[1],22));
      group.append(path,hit,head);
      group.addEventListener("click",()=>tryMove(a.id,group));
      group.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tryMove(a.id,group);}});
      board.appendChild(group);
    }
    //remainingEl.textContent=arrows.length;
    //movesEl.textContent=moves;
    //levelEl.textContent=level;
  }

  function tryMove(id, group) {
    if (busy) return;
    const a=arrows.find(x=>x.id===id);
    if (!a) return;
    if (!canLeave(a,arrows)) {
      group.classList.remove("blocked"); 
      void group.getBBox(); 
      group.classList.add("blocked");
      messageEl.textContent="Путь перекрыт:(";
      return;
    }
    busy=true;
    messageEl.textContent="Путь найден! стрелка влетит ->";
    group.classList.add("leaving");

    // Головка уходит первой, а тело последовательно следует за ней по пути.
    const main=group.querySelector("path.main");
    const head=group.querySelector("polygon.head");
    const originalD=arrowPath(a.cells);
    const last=a.cells[a.cells.length-1];
    const [dx,dy]=a.dir;
    const extendedD=arrowPath([...a.cells,{x:last.x+dx*8,y:last.y+dy*8}]);
    main.setAttribute("d",extendedD);
    const fullLength=main.getTotalLength();
    const originalPath=document.createElementNS("http://www.w3.org/2000/svg","path");
    originalPath.setAttribute("d",originalD);
    const bodyLength=originalPath.getTotalLength();
    const travel=Math.max(0,fullLength-bodyLength);
    main.style.strokeDasharray=`${bodyLength} ${fullLength*2}`;
    main.style.strokeDashoffset="0";

    const duration=720, start=performance.now();
    function animateSnake(now) {
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      const distance=travel*eased;
      main.style.strokeDashoffset=String(-distance);
      const tipDistance=Math.min(fullLength,bodyLength+distance);
      const tip=main.getPointAtLength(tipDistance);
      const before=main.getPointAtLength(Math.max(0,tipDistance-2));
      const vx=tip.x-before.x, vy=tip.y-before.y, norm=Math.hypot(vx,vy)||1;
      const ndx=vx/norm, ndy=vy/norm, px=-ndy, py=ndx, size=22;
      const backX=tip.x-ndx*size*0.72, backY=tip.y-ndy*size*0.72, wing=size*0.78;
      head.setAttribute("points",
        `${tip.x+ndx*size},${tip.y+ndy*size} `+
        `${backX+px*wing},${backY+py*wing} `+
        `${backX-px*wing},${backY-py*wing}`);
      if(t<1) requestAnimationFrame(animateSnake);
      else finishMove();
    }
    function finishMove() {
      arrows=arrows.filter(x=>x.id!==id);
      moves++; busy=false; render();
      if(arrows.length===0) {
        messageEl.textContent="Победа! Поле полностью очищено 🎉";
        messageEl.classList.add("win");
      } else {
        messageEl.classList.remove("win");
        messageEl.textContent="Отлично! Выбери следующую стрелку.";
      }
    }
    requestAnimationFrame(animateSnake);
  }

  function newGame() {
    arrows=generateLevel();
    initial=arrows.map(a=>({...a,cells:a.cells.map(p=>({...p})),dir:[...a.dir]}));
    moves=0; busy=false;
    messageEl.classList.remove("win");
    messageEl.textContent="Нажми на стрелку. Если её путь свободен, она улетит.";
    render();
  }
  document.getElementById("newGame").addEventListener("click",()=>{level++;newGame();});
  document.getElementById("reset").addEventListener("click",()=>{
    arrows=initial.map(a=>({...a,cells:a.cells.map(p=>({...p})),dir:[...a.dir]}));
    moves=0;busy=false;messageEl.classList.remove("win");
    messageEl.textContent="Уровень восстановлен. Попробуй другой порядок!";
    render();
  });

  newGame();
})();
