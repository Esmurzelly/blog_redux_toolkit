import React from 'react';

import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { selectPostById } from './postSlice';

import PostAuthor from './PostAuthor';
import ReactionButton from './ReactionButton';
import TimeAgo from './TimeAgo';

const SinglePostPage = () => {
    const {postId} = useParams();
    const post = useSelector((state) => selectPostById(state, Number(postId)));

    console.log(post)

    if(!post) {
        return (
            <section>
                <h2>Post is not found!</h2>
            </section>
        )
    }
    
  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.body.substring(0, 100)}</p>
      <p className="postCredit">
        <Link to={`/post/edit/${post.id}`}>Edit Post</Link>
        <PostAuthor userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButton post={post} />
    </article>
  );
};

export default SinglePostPage;
