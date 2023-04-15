import React from 'react';

import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

import PostAuthor from './PostAuthor';
import ReactionButton from './ReactionButton';
import TimeAgo from './TimeAgo';

import { selectPostById } from './postSlice';

let PostsExcerpt = ({ postId }) => {
  const post = useSelector(state => selectPostById(state, postId));
  
  return (
    <article>
      <h2>{post.title}</h2>
      <p className='excerpt'>{post.body.substring(0, 75)}...</p>
      {/* <p>{post.body.substring(0, 100)}</p> */}
      <p className="postCredit">
        <Link to={`post/${post.id}`}>View Post</Link>
        <PostAuthor userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButton post={post} />
    </article>
  );
};

PostsExcerpt = React.memo(PostsExcerpt)

export default PostsExcerpt;
