import { describe, expect, it } from 'vitest';
import { makeBackup, parseBackup, backupFilename, BACKUP_VERSION } from '../src/domain/backup';
import { newBoard, type CalculatorBoard, type GoalBoard } from '../src/domain/boards';

describe('Backup local sem perda de dados', () => {
  const calculator = () => {
    const board = newBoard('calculator') as CalculatorBoard;
    board.a = '10';
    board.b = '20';
    board.extraValues = [{ id:'ex-1', amount:'30' },{ id:'ex-2',amount:'40' }];
    board.title = 'Viagem';
    return board;
  };
  it('gera envelope versionado com metadados e quadro intacto', () => {
    const board=calculator();
    const saved=makeBackup([board], '2026-11-06T22:00:00.000Z');
    expect(saved.format).toBe('calculos-modulares-backup');
    expect(saved.version).toBe(BACKUP_VERSION);
    expect(saved.boards).toEqual([board]);
    expect(saved.boards[0].id).toBe(board.id);
    expect(parseBackup(JSON.stringify(saved)).boards).toEqual([board]);
  });
  it('guarda metas e calculadoras com todos os campos', () => {
    const goal=newBoard('goal') as GoalBoard;
    goal.entries=[{id:'goal-1',label:'Pagamento',amount:'1.500,50',sources:[]}];
    const recovered=parseBackup(JSON.stringify(makeBackup([goal,calculator()])));
    expect(recovered.boards).toHaveLength(2);
    const backGoal=recovered.boards[0] as GoalBoard;
    const backCalc=recovered.boards[1] as CalculatorBoard;
    expect(backGoal.entries[0].amount).toBe('1.500,50');
    expect(backCalc.extraValues?.map(v=>v.amount)).toEqual(['30','40']);
  });
  it('não altera os IDs nem os quadros originais ao serializar', () => {
    const board=calculator();
    const before=JSON.stringify(board);
    makeBackup([board]);
    expect(JSON.stringify(board)).toBe(before);
  });
  it('suporta arquivo vazio para usuário sem quadros', () => {
    expect(parseBackup(JSON.stringify(makeBackup([]))).boards).toEqual([]);
  });
  it('impede a importação de JSON inválido ou de outro produto', () => {
    expect(()=>parseBackup('not json')).toThrow(/JSON válido/);
    expect(()=>parseBackup(JSON.stringify({boards:[]}))).toThrow(/não é um backup/);
    expect(()=>parseBackup(JSON.stringify({...makeBackup([]),format:'otro'}))).toThrow(/não é um backup/);
  });
  it('bloqueia backups com versões futuras e datas inválidas', () => {
    expect(()=>parseBackup(JSON.stringify({...makeBackup([]),version:2}))).toThrow(/não é compatível/);
    expect(()=>parseBackup(JSON.stringify({...makeBackup([]),exportedAt:'nada'}))).toThrow(/data/);
  });
  it('valida todos os quadros antes de permitir importar', () => {
    const good=calculator();
    const invalid={...good,id:'outro',schemaVersion:99};
    expect(()=>parseBackup(JSON.stringify({...makeBackup([good]),boards:[good,invalid]}))).toThrow(/inválidos/);
  });
  it('bloqueia registros com IDs repetidos, inclusive calculadoras antigas', () => {
    const first=calculator();
    expect(()=>makeBackup([first, first])).toThrow(/repetidos/);
    expect(()=>parseBackup(JSON.stringify({...makeBackup([first]),boards:[first,first]}))).toThrow(/repetidos/);
    const legacy=calculator();
    delete legacy.extraValues;
    expect(parseBackup(JSON.stringify(makeBackup([legacy]))).boards).toHaveLength(1);
  });
  it('nomes de arquivo usam data local legível', () => {
    expect(backupFilename(new Date(2026,10,6))).toBe('CalculosModulares_Backup_2026-11-06.json');
  });
});
