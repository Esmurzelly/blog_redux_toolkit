import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { sub } from 'date-fns';
import { apiSlice } from '../api/apiSlice';

// const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const postAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query({
      query: () => '/posts',
      transformResponse: responseData => {
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if (!post?.date)
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions)
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          return post;
        });
        return postAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        { type: 'Post', id: 'LIST' },
        ...result.ids.map(id => ({ type: 'Post', id })),
      ],
    }),
    getPostsByUserId: builder.query({
      query: id => `/posts/?userId=${id}`,
      transformResponse: responseData => {
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if (!post?.date)
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions)
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          return post;
        });
        return postAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        ...result.ids.map(id => ({ type: 'Post', id })),
      ],
    }),
    addNewPost: builder.mutation({
      query: initialPost => ({
        url: '/posts',
        method: 'POST',
        body: {
          ...initialPost,
          userId: Number(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          },
        },
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    updatePost: builder.mutation({
      query: initialPost => ({
        url: `/posts/${initialPost.id}`,
        method: 'PUT',
        body: {
          ...initialPost,
          date: new Date().toISOString(),
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }],
    }),
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }],
    }),
    addReaction: builder.mutation({
      query: ({ postId, reactions }) => ({
        url: `posts/${postId}`,
        method: 'PATCH',
        // In a real app, we'd probably need to base this on user ID somehow
        // so that a user can't do the same reaction more than once
        body: { reactions },
      }),
      async onQueryStarted(
        { postId, reactions },
        { dispatch, queryFulfilled }
      ) {
        // `updateQueryData` requires the endpoint name and cache key arguments,
        // so it knows which piece of cache state to update
        const patchResult = dispatch(
          extendedApiSlice.util.updateQueryData(
            'getPosts',
            undefined,
            draft => {
              // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
              const post = draft.entities[postId];
              if (post) post.reactions = reactions;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
} = extendedApiSlice;

// returns the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

// creates memoized selector
const selectPostData = createSelector(
  selectPostsResult,
  postResult => postResult.data
);

// export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
//   try {
//     const response = await axios.get(POSTS_URL);
//     const data = await response.data;
//     return [...data];
//   } catch (err) {
//     return err.message;
//   }
// });

// export const addNewPost = createAsyncThunk(
//   'posts/addNewPost',
//   async initialPost => {
//     try {
//       const response = await axios.post(POSTS_URL, initialPost);
//       return response.data;
//     } catch (err) {
//       return err.message;
//     }
//   }
// );

// export const updatePost = createAsyncThunk(
//   'posts/updatePost',
//   async initialPost => {
//     const { id } = initialPost;
//     try {
//       const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
//       return response.data;
//     } catch (err) {
//       // return err.message;
//       return initialPost;
//     }
//   }
// );

// export const deletePost = createAsyncThunk(
//   'posts/deletePosst',
//   async initialPost => {
//     const { id } = initialPost;
//     try {
//       const response = await axios.delete(`${POSTS_URL}/${id}`, initialPost);
//       if (response?.status === 200) return initialPost;
//       return `${response?.status}: ${response.statusText}`;
//     } catch (err) {
//       return err.message;
//     }
//   }
// );

// const postsSlice = createSlice({
//   name: 'posts',
//   initialState,
//   reducers: {
//     reactionAdded(state, action) {
//       const { postId, reaction } = action.payload;
//       const existingPost = state.entities[postId];
//       if (existingPost) {
//         existingPost.reactions[reaction]++;
//       }
//     },
//     increaseCount(state, action) {
//       state.count = state.count + 1;
//     },
//   },
//   extraReducers(builder) {
//     builder.addCase(fetchPosts.pending, (state, action) => {
//       state.status = 'loading';
//     });
//     builder
//       .addCase(fetchPosts.fulfilled, (state, action) => {
//         state.status = 'succeeded';

//         // Adding date and reactions
//         let min = 1;
//         const loadedPosts = action.payload.map(post => {
//           post.date = sub(new Date(), { minutes: min++ }).toISOString();
//           post.reactions = {
//             thumbUp: 0,
//             wow: 0,
//             heart: 0,
//             rocket: 0,
//             coffee: 0,
//           };
//           return post;
//         });

//         // state.posts = state.posts.concat(loadedPosts);
//         postAdapter.upsertMany(state, loadedPosts);
//       })
//       .addCase(fetchPosts.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message;
//       })
//       .addCase(addNewPost.fulfilled, (state, action) => {
//         action.payload.userId = Number(action.payload.userId);
//         action.payload.date = new Date().toISOString();
//         action.payload.reactions = {
//           thumbUp: 0,
//           wow: 0,
//           heart: 0,
//           rocket: 0,
//           coffee: 0,
//         };

//         // state.posts.push(action.payload);
//         postAdapter.addOne(state, action.payload);
//       })
//       .addCase(updatePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log('Update could not complete');
//           console.log(action.payload);
//           return;
//         }
//         // const { id } = action.payload;
//         action.payload.date = new Date().toISOString();
//         // const posts = state.posts.filter(post => post.id !== id);
//         postAdapter.upsertOne(state, action.payload);
//         // state.posts = [...posts, action.payload];
//       })
//       .addCase(deletePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log('Delete could not complete');
//           console.log(action.payload);
//           return;
//         }
//         const { id } = action.payload;
//         // const posts = state.posts.filter(post => post.id !== id);
//         postAdapter.removeOne(state, id);
//         // state.posts = posts;
//       });
//   },
// });

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postAdapter.getSelectors(state => selectPostData(state) ?? initialState);

// // export const selectAllPosts = state => state.posts.posts;
// export const getPostsStatus = state => state.posts.status;
// export const getPostsError = state => state.posts.error;
// export const getCount = state => state.posts.count;

// // export const selectPostById = (state, postId) =>
// //   state.posts.posts.find(post => post.id === postId);

// export const selectPostsByUser = createSelector(
//   [selectAllPosts, (state, userId) => userId],
//   (posts, userId) => posts.filter(post => post.userId === userId)
// );

// export const { increaseCount, reactionAdded } = postsSlice.actions;

// export default postsSlice.reducer;
