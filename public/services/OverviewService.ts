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

  return {
    getIndices,
  };
};
export default OverviewService;
