export default function attachUserToReq(user, req) {
    const { username, _id, avatar } = user;
    req.user = { username, _id, avatar };
}