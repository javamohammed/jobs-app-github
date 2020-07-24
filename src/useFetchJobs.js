import { useReducer, useEffect } from "react";
import axios from 'axios'

//const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'
const BASE_URL = 'http://localhost:8000/jobs/github'
const ACTIONS = {
    MAKE_REQUEST: 'MAKE_REQUEST',
    GET_DATA: 'GET_DATA',
    ERROR: 'ERROR',
  UPDATE_HAS_NEXT_PAGE: 'update-has-next-page'
}

const reducer = (state, action) => {
        switch (action.type) {
            case ACTIONS.MAKE_REQUEST:
                return {loading : true, jobs:[]}
            case ACTIONS.GET_DATA:
                return {...state, loading : false, jobs:action.payload.jobs}
            case ACTIONS.ERROR:
                return {error: action.payload.error, loading : false, jobs:[]}
            case ACTIONS.UPDATE_HAS_NEXT_PAGE:
                return { ...state, hasNextPage: action.payload.hasNextPage }
            default:
                return state;
        }
}
export default function useFetchJobs(params, page) {

    const [state, dispatch] = useReducer(reducer, {jobs: [], loading: false, error: false} )

    useEffect( () => {

        const cancelToken = axios.CancelToken.source()
        dispatch({type: ACTIONS.MAKE_REQUEST})
        axios.get(BASE_URL, {
            params: { markdown: true, page: page, ...params},
            cancelToken: cancelToken.token
        }).then(res => {
            dispatch({type: ACTIONS.GET_DATA, payload: {jobs: res.data}})
        }).catch(err => {
            console.log(err)
            if(axios.isCancel(err)) return;
            dispatch({type: ACTIONS.ERROR, payload: err})
        })

        const cancelToken2 = axios.CancelToken.source()
        axios.get(BASE_URL, {
          cancelToken: cancelToken2.token,
          params: { markdown: true, page: page + 1, ...params }
        }).then(res => {
          dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { hasNextPage: res.data.length !== 0 } }) 
        }).catch(e => {
          if (axios.isCancel(e)) return
          dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
        })
    
        return () => {
            cancelToken.cancel()
            cancelToken2.cancel()
        }
    }, [params, page])
  return state
} 