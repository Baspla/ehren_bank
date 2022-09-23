module.exports.appTokenRegex = /[^a-zA-Z-\d]/g
module.exports.transactionDescriptionRegex = /[^a-zA-Z\d\s]/g
module.exports.descriptionRegex = /[^a-zA-Z\d\s]/g
module.exports.adminRegex = /[^a-zA-Z-\d]/g
module.exports.displaynameRegex = /[^a-zA-Z-\d\s\p{Emoji_Presentation}]/gu
module.exports.usernameRegex = /[^a-zA-Z-\d]/g
module.exports.appIdRegex = /[^a-zA-Z-]/g
module.exports.sessionRegex = /["':]/g
module.exports.userIdentifierRegex= /["':]/g

module.exports.sanitizeAppId = function (appid)
{
    return appid.replaceAll(module.exports.appIdRegex, "")
}

module.exports.sanitizeSession = function (session)
{
    return session.replaceAll(module.exports.sessionRegex, "")
}
module.exports.sanitizeUserIdentifier = function (uid)
{
    return uid.replaceAll(module.exports.userIdentifierRegex, "")
}

module.exports.sanitizeUsername = function (username) {
    return username.replaceAll(module.exports.usernameRegex, "")
}

module.exports.sanitizeDisplayname = function (displayname) {
    return displayname.replaceAll(module.exports.displaynameRegex, "")
}

module.exports.sanitizeAdmin = function (admin) {
    return admin.replaceAll(module.exports.adminRegex, "")
}

module.exports.sanitizeDescription = function (description) {
    return description.replaceAll(module.exports.descriptionRegex, "")
}

module.exports.sanitizeTransactionDescription = function (description) {
    return description.replaceAll(module.exports.transactionDescriptionRegex, "")
}

module.exports.sanitizeAppToken = function (appToken) {
    return appToken.replaceAll(module.exports.appTokenRegex, "")
}

module.exports.sanitizePermissions = function (permissions) {
    permissions = parseInt(permissions)
    if (Number.isInteger(permissions))
        if (permissions > 0)
            return permissions;
        else return 0;
    else
        return 0;
}

module.exports.sanitizeAmount = function (amount) {
    if (Number.isInteger(amount))
        if (amount > 0)
            return amount;
        else return 0;
    else
        return 0;
}