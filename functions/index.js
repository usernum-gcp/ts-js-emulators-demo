const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

const auth = admin.auth()
const db = admin.firestore()

exports.helloCallable = functions.https.onCall((data, context) => {
  console.log('HELLO')
  return { hello: 'world' }
})

exports.getAuth = functions.https.onCall((data, context) => {
  return context.auth
})

exports.getToken = functions.https.onCall(async (data, context) => {
  const { uid } = context.auth

  return await auth.createCustomToken(uid)
})

exports.getPreDefinedData = functions.https.onCall(async (data, context) => {
  const { postId } = data
  const doc = await db.doc(`post/${postId}`).get()
  return doc.data()
})
