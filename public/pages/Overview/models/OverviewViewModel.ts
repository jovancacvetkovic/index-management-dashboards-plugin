/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from "../../../models/interfaces";
import { CatIndex } from "../../../../server/models/interfaces";

export const OverviewViewModel = (services: BrowserServices) => {
  let indicesViewModel: {
    indices: CatIndex[];
  } = {
    indices: [],
  };

  const fetchIndices = async (queryObject) => {
    indicesViewModel.indices = await getIndices(queryObject);
    return indicesViewModel.indices;
  };

  const getIndices = async (queryObject) => {
    const indicesResponse = await services.overviewService.getIndices(queryObject);

    if (indicesResponse?.ok) {
      return {
        indices: indicesResponse.response.indices,
        indicesCount: indicesResponse.response.totalIndices,
      };
    }

    return [];
  };

  const getAll = () => {
    return indicesViewModel;
  };

  return {
    fetchIndices,
    getAll,
  };
};
