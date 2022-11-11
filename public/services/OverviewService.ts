/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { GetIndicesResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";

const OverviewService = (httpClient: HttpSetup) => {
  const getIndices = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetIndicesResponse>> => {
    let url = `..${NODE_API._INDICES}`;
    if (queryObject.index) url += `/${queryObject.index}`;
    return (await httpClient.get(url, { query: queryObject })) as ServerResponse<GetIndicesResponse>;
  };

  const searchIndices = async (bodyParams: any): Promise<ServerResponse<GetIndicesResponse>> => {
    let url = `..${NODE_API._SEARCH}`;
    return (await httpClient.post(url, { body: JSON.stringify(bodyParams) })) as ServerResponse<GetIndicesResponse>;
  };

  return {
    getIndices,
    searchIndices,
  };
};
export default OverviewService;
