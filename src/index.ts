import type { GraphQLOptions, GraphQLResult } from '@aws-amplify/api-graphql'
import { API, graphqlOperation } from 'aws-amplify'
import type { RecoilState } from 'recoil'
import { atom, useRecoilState } from 'recoil'

export const AmplifyApiIsLoadingAtom = atom<boolean>({
  key: '@ycu-engine/amplify-api-hook/AmplifyApiIsLoadingAtom',
  default: false
})

export const AmplifyApiErrorAtom = atom<any>({
  key: '@ycu-engine/amplify-api-hook/AmplifyApiErrorAtom',
  default: null
})

export interface GraphQLQueryVariables {
  limit?: number
}

export interface GraphQLMutationVariables<T = any> {
  input: T
}

type useAmplifyGraphqlQueryPayload<T, V> = {
  atom: RecoilState<T>
  option: GraphQLOptions
  handler: (result: GraphQLResult<V>) => T | Promise<T>
}

export const useAmplifyGraphqlQuery = <T, V>({
  atom,
  option,
  handler
}: useAmplifyGraphqlQueryPayload<T, V>) => {
  const [data, setData] = useRecoilState(atom)
  const [isLoading, setIsLoading] = useRecoilState(AmplifyApiIsLoadingAtom)
  const [error, setError] = useRecoilState(AmplifyApiErrorAtom)

  const fetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = (await API.graphql(option)) as GraphQLResult<V>
      if (result.errors) {
        setError(result.errors)
        setIsLoading(false)
        return
      }
      const value = await handler(result)
      setData(value)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data,
    isLoading,
    error,
    fetch
  }
}

type useAmplifyGraphqlMutationProps = {
  mutation: string
}

export const useAmplifyGraphqlMutation = <T, V>({
  mutation
}: useAmplifyGraphqlMutationProps) => {
  const [isLoading, setIsLoading] = useRecoilState(AmplifyApiIsLoadingAtom)
  const [error, setError] = useRecoilState(AmplifyApiErrorAtom)

  const mutate = async (variable: GraphQLMutationVariables<T>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = (await API.graphql(
        graphqlOperation(mutation, variable)
      )) as GraphQLResult<V>
      if (result.errors) {
        setError(result.errors)
      } else {
        setIsLoading(false)
        return result.data
      }
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
    return undefined
  }

  return {
    isLoading,
    error,
    mutate
  }
}
