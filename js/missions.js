
export const missions = [
    {
        id: 1,
        title: 'Desperte',
        description: 'Descubra onde você está.',
        completed: false
    },
    {
        id: 2,
        title: 'A rua vazia',
        description: 'Explore o Distrito Central.',
        completed: false
    },
    {
        id: 3,
        title: 'Fotografias',
        description: 'Encontre uma fotografia misteriosa.',
        completed: false
    },
    {
        id: 4,
        title: 'O primeiro segredo',
        description: 'Descubra o que aconteceu com os habitantes.',
        completed: false
    }
];

export function completeMission(id) {
    const mission = missions.find(item => item.id === id);

    if (!mission || mission.completed) return false;

    mission.completed = true;
    return true;
}

export function getCurrentMission() {
    return missions.find(mission => !mission.completed) || null;
}
