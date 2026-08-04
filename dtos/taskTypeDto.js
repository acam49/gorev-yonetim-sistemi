const toTaskTypeDto = (type) => {
    if (!type) return null;
    const raw = typeof type.toJSON === 'function' ? type.toJSON() : type;
    return {
        id: raw.id,
        name: raw.name,
        createdAt: raw.createdAt
    };
};

const toTaskTypeListDto = (types) => {
    if (!Array.isArray(types)) return [];
    return types.map(toTaskTypeDto);
};

module.exports = {
    toTaskTypeDto,
    toTaskTypeListDto
};
