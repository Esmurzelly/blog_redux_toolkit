import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPostById } from './postSlice';
import { useParams, useNavigate } from 'react-router-dom';

import { selectAllUsers } from '../users/usersSlice';
import { useUpdatePostMutation, useDeletePostMutation } from './postSlice';

const EditPostForm = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [updatePost, {isLoading}] = useUpdatePostMutation();
  const [deletePost] = useDeletePostMutation();

  const post = useSelector(state => selectPostById(state, Number(postId)));
  const users = useSelector(selectAllUsers);

  const [title, setTitle] = useState(post?.title);
  const [content, setContent] = useState(post?.body);
  const [userId, setUserId] = useState(post?.userId);


  if (!post) {
    return (
      <section>
        <h2>Post in not found</h2>
      </section>
    );
  }

  const onTitleChanged = e => setTitle(e.target.value);
  const onContentChanged = e => setContent(e.target.value);
  const onAuthorChanged = e => setUserId(Number(e.target.value));

  const canSave =
    [title, content, userId].every(Boolean) && !isLoading;

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        await updatePost({id: post.id, title, body: content, userId}).unwrap()
        
        setTitle('');
        setContent('');
        setUserId('');

        navigate(`/post/${postId}`);
      } catch (error) {
        console.log('Failed to save the post', error);
      }
    }
  };

  const onDeletePostClicked = async () => {
    try {
      await deletePost({ id: post.id }).unwrap();

      setTitle('');
      setContent('');
      setUserId('');
      navigate('/');
    } catch (error) {
      console.log('Failed to save the post', error);
    }
  };

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ));

  return (
    <section>
      <h2>Edit Post</h2>

      <form>
        <label htmlFor="postTitle">Post Title: </label>
        <input
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
          type="text"
        />

        <label htmlFor="postAuthor">Author: </label>
        <select
          id="postAuthor"
          defaultValue={userId}
          onChange={onAuthorChanged}
        >
          <option value=""></option>
          {usersOptions}
        </select>

        <label htmlFor="postContent">Content: </label>
        <textarea
          name="postContent"
          id="postContent"
          value={content}
          onChange={onContentChanged}
        />

        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>

        <button type="button" onClick={onDeletePostClicked} disabled={!canSave}>
          Delete Post
        </button>
      </form>
    </section>
  );
};

export default EditPostForm;
