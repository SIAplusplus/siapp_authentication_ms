import { authenticate } from 'ldap-authentication';

let ldapAuthenticate = async (body) => {
    console.log("body of ldap"+body.username)
    try {
        return await authenticate({
            ldapOpts: { url: 'ldap://localhost' },
            adminDn: 'cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co',
            adminPassword: 'admin',
            verifyUserExists: true,
            userSearchBase: 'dc=arqsoft,dc=unal,dc=edu,dc=co',
            usernameAttribute: 'uid',
            username: body.username,
            //password: body.password,
        }).then()
    } catch(error){
        console.log("error in ldapAuthenticate")
        return false
    }
}
let ldapAsyncAuthenticate = async(body) => {
    return await ldapAuthenticate(body)
}

export default ldapAsyncAuthenticate;