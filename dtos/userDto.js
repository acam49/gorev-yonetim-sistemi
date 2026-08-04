const toUserDto = (user) => {
    if (!user) return null;
    const raw = typeof user.toJSON === 'function' ? user.toJSON() : user;
    const { password, ...cleanUser } = raw;
    return cleanUser;
};

const toUserListDto = (users) => {
    if (!Array.isArray(users)) return [];
    return users.map(toUserDto);
};

module.exports = {
    toUserDto,
    toUserListDto
};
