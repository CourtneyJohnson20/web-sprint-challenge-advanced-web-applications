import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)
  const [temp, setTemp] = useState('')

  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/')}
  const redirectToArticles = () => { navigate('/articles') }

  const logout = () => {
    localStorage.removeItem('token')
    setMessage('Goodbye!')
    navigate('/')
  }

  const login = async ({ username, password }) => {
    setMessage('')
    setSpinnerOn(true)
    try {
      const { data } = await axios.post(
        loginUrl,
        { username, password}
      )
      localStorage.setItem('token', data.token)
      redirectToArticles()
      getArticles()
    } catch (error) {
      setMessage('an Error has occured. Please try again')
    } finally {
      setSpinnerOn(false)
    }
  }

  const getArticles = async () => {
    setMessage('')
    setSpinnerOn(!spinnerOn)
    const token = localStorage.getItem('token')
    if (!token) {
      logout()
    } else {
      const fetchArticles =  async () => {
        try {
          const response = await axios.get(
            articlesUrl,
            {headers: {Authorization: token}}
          )
          setArticles(response.data.articles)
          setMessage(response.data.message)
        } catch (error) {
          if (error?.response?.status === 401){
            logout()
          }
        } finally {
          setSpinnerOn(false)
        }
      }
      fetchArticles()
    }
  }

  const postArticle = async (article) => {
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    if (!token) {
      logout()
    } else {
      try {
        const response = await axios.post(
          articlesUrl,
          { title: article.title, text: article.text, topic: article.topic }, // pass article properties directly
          { headers: { Authorization: token } }
        )
        getArticles() 
        setTemp(response.data.message) 
      } catch (error) {
        if (error?.response?.status === 401) {
          logout() 
        }
      } finally {
        setSpinnerOn(false) 
      }
    }
  }
  

  const updateArticle = async ({ article_id, article }) => {
    setMessage('') 
    setSpinnerOn(true) 
    const token = localStorage.getItem('token')
    if (!token) {
      logout() 
    } else {
      try {
        const response = await axios.put(
          `${articlesUrl}/${article_id}`, 
          { title: article.title, text: article.text, topic: article.topic }, 
          { headers: { Authorization: token } }
        )
        getArticles()
        setTemp(response.data.message) 
      } catch (error) {
        if (error?.response?.status === 401) {
          logout() 
        } else {
          setMessage('An error occurred while updating the article')
        }
      } finally {
        setSpinnerOn(false) 
      }
    }
  }
  

  const deleteArticle = async (article_id) => {
    setMessage('') 
    setSpinnerOn(true) 
    const token = localStorage.getItem('token')
    if (!token) {
      logout() 
    } else {
      try {
        const response = await axios.delete(`${articlesUrl}/${article_id}`, {
          headers: { Authorization: token },
        })
        getArticles()
        setTemp(response.data.message) 
      } catch (error) {
        if (error?.response?.status === 401) {
          logout() 
        } else {
          setMessage('An error occurred while deleting the article')
        }
      } finally {
        setSpinnerOn(false) 
      }
    }
  }
  

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <Message message={temp}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <>
              <ArticleForm  
                setCurrentArticleId={setCurrentArticleId} 
                postArticle={postArticle}
                currentArticleId={currentArticleId}
                articles={articles}
                updateArticle={updateArticle}
              />
              <Articles 
              setCurrentArticleId={setCurrentArticleId} 
              articles={articles} 
              getArticles={getArticles}
              deleteArticle={deleteArticle} 
              updateArticle={updateArticle}
              currentArticleId={currentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
