
export const chapters = [
    {
        id: 1,
        title: 'O Despertar',
        description: 'Você acordou em uma cidade desconhecida.',
        objective: 'Descubra onde está.',
        unlocked: true,
        completed: false
    },
    {
        id: 2,
        title: 'Arquivos Esquecidos',
        description: 'Os registros da delegacia escondem informações.',
        objective: 'Investigue a delegacia abandonada.',
        unlocked: false,
        completed: false
    },
    {
        id: 3,
        title: 'A Casa Vazia',
        description: 'Uma casa guarda lembranças de seus antigos moradores.',
        objective: 'Investigue a casa abandonada.',
        unlocked: false,
        completed: false
    },
    {
        id: 4,
        title: 'O Observador',
        description: 'Existe algo acompanhando seus movimentos.',
        objective: 'Descubra quem está observando você.',
        unlocked: false,
        completed: false
    }
];

export function getCurrentChapter() {
    return chapters.find(
        chapter => chapter.unlocked && !chapter.completed
    ) || null;
}

export function completeChapter(id) {
    const chapter = chapters.find(item => item.id === id);

    if (!chapter || chapter.completed) return false;

    chapter.completed = true;

    const next = chapters.find(item => item.id === id + 1);

    if (next) {
        next.unlocked = true;
    }

    return true;
}

export function getChapters() {
    return chapters;
}
