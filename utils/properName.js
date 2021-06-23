export default function properName(owner, user, own) {
    let username = owner.username.split(' ')[0] + '`s';
    if (owner._id.toString() === user._id.toString()) {
        username = own || 'your';
    }
    return username;
}