import 'cross-fetch/polyfill'  // access to fetch api
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { getPosts, getMyPost, updatePost, createPost, deletePost, subscribeToPosts } from './utils/operations'

const client = getClient()
beforeEach( seedDatabase )

test('should expose only public post', async () => {
    const response = await client.query({ query: getPosts })

    expect(response.data.posts.length).toBe(1)
    expect(response.data.posts[0].published).toBe(true)
})

test('should fetch my posts', async () => {
    const client = getClient(userOne.jwt)

    const { data } = await client.query({ query: getMyPost })
    expect(data.myPosts.length).toBe(2)
})

test('should be able to update own post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postOne.post.id,
        data: {
            published: false
        }
    }
    const { data } = await client.mutate({ mutation: updatePost, variables })
    const exists = await prisma.exists.Post({ id: postOne.post.id, published: false })

    expect(exists).toBe(true)
    expect(data.updatePost.published).toBe(false)
})

test('should create post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        data: {
            title: "Andrew",
            body: "plz work3",
            published: false
        }
    }

    const { data } = await client.mutate({ mutation: createPost, variables })
    const exists = await prisma.exists.Post({ id: data.id })

    expect(exists).toBe(true)
    expect(data.createPost.title).toBe('Andrew')
})

test('should be able to delete post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postTwo.post.id
    }

    await client.mutate({ mutation: deletePost, variables })
    const exists = await prisma.exists.Post({ id: postTwo.post.id })
    
    expect(exists).toBe(false)
})


test('Should subscribe to changes for published posts', async (done) => {
    client.subscribe({ query: subscribeToPosts }).subscribe({
        next(response) {
            expect(response.data.post.mutation).toBe('DELETED')
            done()
        }
    })

    await prisma.mutation.deletePost({ where: { id: postOne.post.id } })
})