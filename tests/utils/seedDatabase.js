import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../src/prisma'

const userOne = {
    input: {
        name: 'Jen',
        email: 'jen@example.com',
        password: bcrypt.hashSync('Red09ljk8765')
    },
    user: undefined,
    jwt: undefined
}

const userTwo = {
    input: {
        name: 'Ruby',
        email: 'ruby@example.com',
        password: bcrypt.hashSync('Ruby12345')
    },
    user: undefined,
    jwt: undefined
}

const postOne = {
    input: {
        title: 'About test1',
        body: 'test test test1',
        published: true
    },
    post: undefined
}

const postTwo = {
    input: {
        title: 'About test2',
        body: 'test test test2',
        published: false
    },
    post: undefined
}

const commentOne = {
    input: {
        text: 'this is commentOne'
    },
    comment: undefined
}

const commentTwo = {
    input: {
        text: 'this is commentTwo'
    },
    comment: undefined
}

// Execute before each test case
const seedDatabase = async () => {   
    // Deal with slow internet
    jest.setTimeout(1000000)  
    
    // Delete test data
    await prisma.mutation.deleteManyComments()
    await prisma.mutation.deleteManyPosts()     
    await prisma.mutation.deleteManyUsers()     

    // Create User 1
    userOne.user = await prisma.mutation.createUser({          
        data: userOne.input
    })
    // Create JWT 
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

    // Create User 2
    userTwo.user = await prisma.mutation.createUser({          
        data: userTwo.input
    })
    // Create JWT
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)


    // Create Post 1
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    // Create Post 2
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    // Create Comment on Post 1 by User 2
    commentOne.comment = await prisma.mutation.createComment({
        data: { 
            ...commentOne.input,
            author: {
                connect: {
                    id: userTwo.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })

    // Create Comment on Post 1 by User 1
    commentTwo.comment = await prisma.mutation.createComment({
        data: { 
            ...commentTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })

}

export { seedDatabase as default, userOne, userTwo, postOne, postTwo, commentOne, commentTwo }