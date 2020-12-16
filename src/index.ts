import type { GraphQLOptions, GraphQLResult } from '@aws-amplify/api-graphql'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'
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

export { GRAPHQL_AUTH_MODE }
type useAmplifyGraphqlQueryPayload<T, V> = {
  atom: RecoilState<T>
  option: GraphQLOptions
  handler: (result: Exclude<V, null>) => T | Promise<T>
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
      if (!result.data) {
        setError(['result is empty'])
        setIsLoading(false)
        return
      }
      const value = await handler(result.data)
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
