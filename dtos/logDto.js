const toLogDto = (log) => {
    if (!log) return null;
    const raw = typeof log.toJSON === 'function' ? log.toJSON() : log;
    return {
        id: raw.id,
        userId: raw.userId,
        actorName: raw.actorName,
        actorRole: raw.actorRole,
        action: raw.action,
        details: raw.details,
        timestamp: raw.timestamp || raw.createdAt
    };
};

const toLogListDto = (logs) => {
    if (!Array.isArray(logs)) return [];
    return logs.map(toLogDto);
};

module.exports = {
    toLogDto,
    toLogListDto
};
