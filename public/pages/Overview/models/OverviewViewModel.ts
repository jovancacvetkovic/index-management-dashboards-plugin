/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from "../../../models/interfaces";
import { CatIndex } from "../../../../server/models/interfaces";
import { HttpFetchQuery } from "opensearch-dashboards/public";
import { useState } from "react";

interface OverviewIndicesResponse {
  indices: CatIndex[];
  indicesCount: number;
}

interface OverviewDocsResponse {
  docs: CatIndex[];
  docsCount: number;
}

export const OverviewViewModel = (services: BrowserServices) => {
  const [model, setModel] = useState<OverviewIndicesResponse>({
    indices: [],
    indicesCount: 0,
  });
  const [docs, setDocs] = useState<OverviewDocsResponse>({
    docs: [],
    docsCount: 0,
  });

  const getIndices = async (queryObject: HttpFetchQuery) => {
    const indicesResponse = await services.overviewService.getIndices(queryObject);

    let response = {
      indices: [],
      indicesCount: 0,
    };

    if (indicesResponse?.ok) {
      response = {
        indices: indicesResponse.response.indices,
        indicesCount: indicesResponse.response.totalIndices,
      };
    }
    setModel(response);
    return response;
  };

  const searchIndices = async (queryObject: HttpFetchQuery) => {
    const indicesResponse = await services.overviewService.searchIndices(queryObject);

    let response = {
      docs: [],
      docsCount: 0,
    };

    if (indicesResponse?.ok) {
      response = {
        docs: indicesResponse.response.indices,
        docsCount: indicesResponse.response.totalIndices,
      };
    }
    setDocs(response);
    return response;
  };

  const getAllIndices = () => {
    return model;
  };

  const getAllDocs = () => {
    return docs;
  };

  return {
    searchIndices,
    getIndices,
    getAllIndices,
    getAllDocs,
  };
};
