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

test('we are able to throw a HttpsError from CF', async () => {
  expect(testFunctions.httpsCallable('testHttpsError')()).rejects.toThrow(
    'we are testing HttpsError'
  )
})

test('create a managed post', async () => {
  const managerId = 'fooManager'
  await testDb.doc(`managers/${managerId}`).set({ id: managerId })

  const { data } = await testFunctions.httpsCallable('createPrivatePost')({
    managerId
  })

  const { auther } = (await testDb.doc(`posts/${data}`).get()).data()
  expect(auther).toBe(managerId)
})

test('Can not create a managed post by non-manager user', async () => {
  const managerId = 'fooManager2'
  const wrongMangerId = 'barManager2'
  await testDb.doc(`managers/${wrongMangerId}`).set({ id: wrongMangerId })

  expect(
    testFunctions.httpsCallable('createPrivatePost')({
      managerId
    })
  ).rejects.toThrow('You are not a manager')
})
