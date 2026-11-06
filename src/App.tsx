import { useEffect, useRef, useState } from 'react';
import { newId } from './domain/ids';
import type { Board, CalculatorBoard, Entry, GoalBoard, Operation } from './domain/boards';
import { newBoard, duplicateBoard, newEntry, swapOperands } from './domain/boards';
import { calculate, goalSummary } from './domain/math';
import { Decimal, formatDecimal, money } from './domain/numbers';
import { storage } from './storage/db';
import { WriteQueue } from './storage/writeQueue';
import { AmountInput } from './components/AmountInput';
import './styles.css';

type IconName = 'plus' | 'pencil' | 'ellipsis' | 'trash' | 'chevron-right';
function Icon({ name }: { name: IconName }) {
  return <img className="icon" src={import.meta.env.BASE_URL + 'mmu-icons/' + name + '.svg'} alt="" aria-hidden="true"/>;
}
function KindText({ kind }: {kind: Board['kind']}) {
  return <span className="kind-tag">{kind === 'goal' ? 'Meta' : 'Calculadora'}</span>;
}
function GoalPreview({ board }: {board: GoalBoard}) {
  const result = goalSummary(board.target, board.entries.map(e=>e.amount));
  if (!result.ok) return <span className="preview-sub">Dados incompletos</span>;
  if (!result.percent) return <span className="preview-sub">{money(result.sum)} recebidos</span>;
  return <div className="library-progress"><span className="preview-sub">{money(result.sum)} recebidos</span><span className="preview-sub">{formatDecimal(result.percent,1)}%</span><div className="thin-track"><div style={{width:result.visualPercent+'%'}}/></div></div>;
}
function CalculatorPreview({board}: {board: CalculatorBoard}) {
  const result = calculate(board.a, board.b, board.operation);
  return <span className="preview-sub">{result.ok ? (board.display === 'brl' ? money(result.value) : formatDecimal(result.value, Math.min(6,result.value.decimalPlaces()))) : 'Aguardando valores'}</span>;
}

function GoalView({board, update}: {board: GoalBoard, update: (board: GoalBoard)=>void}) {
  const result = goalSummary(board.target, board.entries.map(entry=>entry.amount));
  const setEntry = (id: string, change: Partial<Entry>) => update({
    ...board, entries: board.entries.map(e => e.id === id ? {...e,...change} : e)
  });
  const add = () => update({...board, entries:[...board.entries, newEntry()]});
  const duplicate = (entry: Entry) => update({...board, entries:[...board.entries, {...entry,id:newId(),label:entry.label+' (cópia)'}]});
  const remove = (id:string) => update({...board, entries:board.entries.filter(e=>e.id!==id)});
  return <>
    <section className="panel primary-panel">
      <span className="section-eyebrow">OBJETIVO</span>
      <AmountInput label="Quanto você quer alcançar?" value={board.target} onChange={v=>update({...board,target:v})}/>
    </section>
    <section className="panel">
      <div className="section-title-line">
        <div><h2>Entradas</h2><p className="muted">Adicione valores para acompanhar sua meta.</p></div>
        <button className="small-add" onClick={add} type="button"><Icon name="plus"/> Adicionar</button>
      </div>
      {board.entries.length===0
        ? <div className="empty-list">Nenhuma entrada ainda. Comece adicionando um recebimento.</div>
        : <div className="entries">{board.entries.map((entry,index)=><div className="entry-item" key={entry.id}>
            <div className="entry-head">
              <span className="entry-count">Entrada {index+1}</span>
              <div className="entry-actions">
                <button type="button" className="icon-button" onClick={()=>duplicate(entry)} aria-label={'Duplicar '+entry.label} title="Duplicar"><Icon name="plus"/></button>
                <button type="button" className="icon-button danger" onClick={()=>remove(entry.id)} aria-label={'Excluir '+entry.label} title="Excluir"><Icon name="trash"/></button>
              </div>
            </div>
            <label className="text-control"><span className="field-label">Descrição</span><input type="text" maxLength={100} value={entry.label} placeholder="Nome da entrada" onChange={e=>setEntry(entry.id,{label:e.target.value})}/></label>
            <AmountInput label="Valor recebido" value={entry.amount} onChange={v=>setEntry(entry.id,{amount:v})}/>
          </div>)}</div>}
    </section>
    <section className="panel summary-panel" aria-live="polite">
      <div className="section-title-line"><div><span className="section-eyebrow">RESUMO AUTOMÁTICO</span><h2>Seu progresso</h2></div></div>
      {result.ok ? <>
        <div className="result-amount"><span>Total recebido</span><strong>{money(result.sum)}</strong></div>
        {result.percent ? <>
          <div className="progress-head"><span>Progresso da meta</span><strong>{formatDecimal(result.percent,1)}%</strong></div>
          <div className="progress-track" role="progressbar" aria-label="Progresso da meta" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.visualPercent}>
            <div style={{width: result.visualPercent+'%'}}/>
          </div>
          <div className="result-footer">
            {result.excess.gt(0) ? <><span>Acima da meta</span><strong className="success-text">{money(result.excess)}</strong></>
              : <><span>Ainda faltam</span><strong>{money(result.remaining)}</strong></>}
          </div>
          {result.excess.gt(0) && <p className="success-note">Meta alcançada e superada.</p>}
        </> : <p className="note-warning">Defina uma meta maior que zero para calcular o percentual. O total continua disponível.</p>}
      </> : <div className="note-warning">{result.error}</div>}
    </section>
  </>;
}

const ops: {symbol:string, title:string, value: Operation}[] = [
  {symbol:'+',title:'Somar',value:'+'},
  {symbol:'−',title:'Subtrair',value:'-'},
  {symbol:'×',title:'Multiplicar',value:'*'},
  {symbol:'÷',title:'Dividir',value:'/'},
];
function CalculatorView({board, update}: {board: CalculatorBoard, update:(board:CalculatorBoard)=>void}) {
  const result = calculate(board.a,board.b,board.operation);
  const display = result.ok
    ? board.display === 'brl' ? money(result.value)
      : formatDecimal(result.value, Math.min(6, result.value.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).decimalPlaces()))
    : null;
  return <>
    <section className="panel">
      <div className="section-title-line"><h2>Seus valores</h2><div className="format-toggle" aria-label="Formato de números">
        <button type="button" className={board.display==='brl' ? 'selected' : ''} onClick={()=>update({...board,display:'brl'})}>R$</button>
        <button type="button" className={board.display==='number' ? 'selected' : ''} onClick={()=>update({...board,display:'number'})}>Número</button>
      </div></div>
      <AmountInput label="Primeiro valor" currency={board.display==='brl'} value={board.a} onChange={v=>update({...board,a:v})}/>
      <div className="operations" role="group" aria-label="Operação matemática">{ops.map(o=>
        <button key={o.value} title={o.title} type="button" aria-label={o.title} aria-pressed={board.operation===o.value}
          className={board.operation===o.value ? 'selected' : ''} onClick={()=>update({...board,operation:o.value})}>{o.symbol}</button>
      )}</div>
      <AmountInput label="Segundo valor" currency={board.display==='brl'} value={board.b} onChange={v=>update({...board,b:v})}/>
      <button className="secondary-button swap" type="button" onClick={()=>update(swapOperands(board))}>Inverter os valores</button>
    </section>
    <section className="panel summary-panel">
      <span className="section-eyebrow">RESULTADO AUTOMÁTICO</span>
      <div className="large-result" aria-live="polite">{display ?? <span className="result-hint">{result.ok ? '' : result.error}</span>}</div>
      <p className="muted">O resultado muda automaticamente quando você altera os valores.</p>
    </section>
  </>;
}
export default function App() {
  const [boards,setBoards] = useState<Board[]>([]);
  const boardsRef = useRef<Board[]>([]);
  const [activeId,setActiveId] = useState<string|null>(null);
  const [loading,setLoading] = useState(true);
  const [status,setStatus] = useState<'saved'|'saving'|'error'>('saved');
  const [error,setError] = useState('');
  const queue = useRef(new WriteQueue());
  useEffect(()=>{
    let alive=true;
    storage.list().then(items=>{if(alive){boardsRef.current=items;setBoards(items);}})
      .catch(e=>{if(alive){setError(e instanceof Error?e.message:'Erro ao ler quadros. Dados preservados.');setStatus('error');}})
      .finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  },[]);
  function updateState(next:Board[]) { boardsRef.current=next;setBoards(next); }
  function save(board:Board) {
    const updated={...board,updatedAt:new Date().toISOString()} as Board;
    const all=boardsRef.current.some(b=>b.id===updated.id) ? boardsRef.current.map(b=>b.id===updated.id?updated:b) : [updated,...boardsRef.current];
    updateState(all);
    setStatus('saving');
    queue.current.run(()=>storage.put(updated))
      .then(()=>{if(queue.current.pending===0)setStatus('saved');})
      .catch(e=>{setStatus('error');setError('Falha ao salvar. Mantenha o aplicativo aberto e tente novamente. '+String(e));});
  }
  function create(kind:Board['kind']) {const b=newBoard(kind);save(b);setActiveId(b.id);}
  function remove(board:Board) {
    if(!window.confirm('Excluir "'+board.title+'"? Essa ação não pode ser desfeita.'))return;
    updateState(boardsRef.current.filter(b=>b.id!==board.id));
    setActiveId(current=>current===board.id?null:current);
    setStatus('saving');
    queue.current.run(()=>storage.remove(board.id))
      .then(()=>{if(queue.current.pending===0)setStatus('saved');})
      .catch(e=>{setStatus('error');setError('Falha ao excluir: '+String(e));});
  }
  const active=boards.find(b=>b.id===activeId);
  if(loading)return <div className="shell"><div className="loading">Abrindo seus quadros…</div></div>;
  return <div className="shell">
    <header className="app-header">
      <div className="header-inner">
        {active ? <button type="button" className="back-button" onClick={()=>setActiveId(null)}>Biblioteca</button>
          : <span className="eyebrow">SEU ESPAÇO DE CÁLCULOS</span>}
        <div className="header-title"><h1>{active?'Quadro':'Cálculos Modulares'}</h1><span className="save-indicator" role="status">{status==='saving'?'Salvando…':status==='error'?'Erro ao salvar':'Salvo automaticamente'}</span></div>
      </div>
    </header>
    <main className="main">
      {error && <div className="error-banner" role="alert">{error}<button type="button" onClick={()=>setError('')}>Fechar aviso</button></div>}
      {active ? <>
        <div className="board-heading"><label className="text-control board-title"><span className="field-label">NOME DO QUADRO</span><input type="text" maxLength={100} aria-label="Nome do quadro" value={active.title} onChange={e=>save({...active,title:e.target.value})}/></label><KindText kind={active.kind}/></div>
        {active.kind==='goal' ? <GoalView board={active} update={save}/> : <CalculatorView board={active} update={save}/>}
        <div className="board-bottom"><button className="danger-text" type="button" onClick={()=>remove(active)}><Icon name="trash"/>Excluir quadro</button></div>
      </> : <>
        <div className="intro"><h2>O que vamos calcular?</h2><p>Crie um quadro, preencha os valores e acompanhe os resultados. Tudo é salvo automaticamente.</p></div>
        <div className="new-grid">
          <button type="button" className="new-card" onClick={()=>create('goal')}><span className="circle-add"><Icon name="plus"/></span><strong>Nova meta</strong><span>Entradas e progresso</span></button>
          <button type="button" className="new-card" onClick={()=>create('calculator')}><span className="circle-add"><Icon name="plus"/></span><strong>Nova calculadora</strong><span>Operações rápidas</span></button>
        </div>
        <div className="library-title"><h2>Minha biblioteca</h2><span>{boards.length} {boards.length===1?'quadro':'quadros'}</span></div>
        {boards.length===0 ? <section className="library-empty"><p>Seus quadros vão aparecer aqui.</p><span>Escolha um dos modelos acima para começar.</span></section> :
        <div className="board-list">{boards.map(board=><article className="board-card" key={board.id}>
          <button type="button" className="board-open" onClick={()=>setActiveId(board.id)} aria-label={'Abrir '+board.title}>
            <div className="board-card-head"><KindText kind={board.kind}/><Icon name="chevron-right"/></div>
            <strong>{board.title||'Sem título'}</strong>
            {board.kind==='goal'?<GoalPreview board={board}/>:<CalculatorPreview board={board}/>}
          </button>
          <div className="board-card-actions">
            <button type="button" onClick={()=>{const copy=duplicateBoard(board);save(copy);setActiveId(copy.id);}}>Duplicar</button>
            <button type="button" className="danger-text" onClick={()=>remove(board)}><Icon name="trash"/>Excluir</button>
          </div>
        </article>)}</div>}
      </>}
    </main>
    <footer className="app-footer">Os dados ficam neste aparelho. O armazenamento local não substitui um backup.</footer>
  </div>;
}
