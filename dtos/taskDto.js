const toTaskDto = (task) => {
    if (!task) return null;
    const raw = typeof task.toJSON === 'function' ? task.toJSON() : task;
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        status: raw.status,
        startDate: raw.startDate,
        plannedDate: raw.plannedDate,
        deadline: raw.deadline,
        assignedToId: raw.assignedToId,
        taskTypeId: raw.taskTypeId,
        assignedTo: raw.assignedTo ? {
            id: raw.assignedTo.id,
            username: raw.assignedTo.username,
            fullName: raw.assignedTo.fullName,
            role: raw.assignedTo.role
        } : null,
        taskType: raw.taskType ? {
            id: raw.taskType.id,
            name: raw.taskType.name
        } : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
    };
};

const toTaskListDto = (tasks) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.map(toTaskDto);
};

module.exports = {
    toTaskDto,
    toTaskListDto
};
