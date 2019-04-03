import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne, commentOne, commentTwo, postOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { deleteComment, subscribeToComments } from './utils/operations'

beforeEach(seedDatabase)
const client = getClient()


test('should delete own comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentTwo.comment.id
    }
    await client.mutate({ mutation: deleteComment, variables })
    const exists = await prisma.exists.Comment({ id: commentTwo.comment.id })
    expect(exists).toBe(false)
})

test('should not delete others comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentOne.comment.id
    }
    await expect(
        client.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow()
})

// done() が呼ばれるまでテストは終わっていないとみなされる
test('Should subscribe to comments for a post', async (done) => {
    const variables = {
        postId: postOne.post.id
    }
    client.subscribe({ query: subscribeToComments, variables }).subscribe({
        next(response) {
            expect(response.data.comment.mutation).toBe('DELETED')
            done()
        }
    })

    await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id }})
})