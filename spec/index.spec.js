const firebase = require('@firebase/testing')

const testApp = firebase.initializeTestApp({
  projectId: 'test-functions-emulators',
  auth: {
    uid: 'bob',
    email: 'bob@test.com',
    role: 'manager'
  }
})

const testFunctions = testApp.functions()
testFunctions.useFunctionsEmulator('http://localhost:5001')

const testDb = testApp.firestore()

test('we are able to call the callable function', async () => {
  const result = await testFunctions.httpsCallable('helloCallable')()

  expect(result.data).toMatchObject({ hello: 'world' })
})

test('we are able to get auth from CF', async () => {
  const result = await testFunctions.httpsCallable('getAuth')()
  console.log(result)

  expect(result).toBeTruthy()
})

test('we are able to get custom token from CF', async () => {
  const result = await testFunctions.httpsCallable('getToken')()
  console.log(result)

  expect(result).toBeTruthy()
})

test.only('we are able to get and set data from CF', async () => {
  const postId = '001'
  await testDb.doc(`post/${postId}`).set({
    name: 'post001'
  })

  const result = await testFunctions.httpsCallable('getPreDefinedData')({
    postId
  })

  console.log(result)

  expect(result).toBeTruthy()
})
