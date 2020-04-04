const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

const auth = admin.auth()
const db = admin.firestore()
const { FieldValue } = admin.firestore
const { HttpsError, onCall } = functions.https

exports.helloCallable = onCall((data, context) => {
  console.log('HELLO')
  return { hello: 'world' }
})

exports.getAuth = onCall((data, context) => {
  return context.auth
})

exports.getToken = onCall(async (data, context) => {
  const { uid } = context.auth

  return await auth.createCustomToken(uid)
})

exports.testHttpsError = onCall(async (data, context) => {
  throw new HttpsError('not-found', 'we are testing HttpsError')
})

exports.createPrivatePost = onCall(async (data, context) => {
  const { managerId } = data
  const { exists } = await db.doc(`managers/${managerId}`).get()
  if (!exists) throw new HttpsError('not-found', 'You are not a manager')

  await db.doc(`posts/${context.auth.uid}`).set({
    auther: managerId,
    createdAt: FieldValue.serverTimestamp()
  })

  return context.auth.uid
})
