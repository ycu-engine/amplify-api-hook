import type { GraphQLResult } from '@aws-amplify/api-graphql'
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

export interface GraphQLVariables {
  limit?: number
}

export const useAmplifyGraphql = <T, V>(
  atom: RecoilState<T>,
  graphql: string,
  variables: GraphQLVariables,
  handler: (result: GraphQLResult<V>) => T | Promise<T>
) => {
  const [data, setData] = useRecoilState(atom)
  const [isLoading, setIsLoading] = useRecoilState(AmplifyApiIsLoadingAtom)
  const [error, setError] = useRecoilState(AmplifyApiErrorAtom)

  const fetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = (await API.graphql(
        graphqlOperation(graphql, variables)
      )) as GraphQLResult<V>
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
