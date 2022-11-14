/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OverviewService, ServicesContext } from "../../../services";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { BrowserServices } from "../../../models/interfaces";
import { BREADCRUMBS } from "../../../utils/constants";
import { NotificationsStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../components/core_services";
import { OverviewViewModel } from "../models/OverviewViewModel";
import { CatIndex } from "../../../../server/models/interfaces";
import { IndicesTable } from "../components/IndicesTable";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../Indices/utils/constants";
import { CriteriaWithPagination, ArgsWithError, ArgsWithQuery } from "@elastic/eui";
import { ContentPanel } from "../../../components/ContentPanel";
import { IndicesSearch } from "../components/IndicesSearch";
import _ from "lodash";

export interface OverviewProps extends RouteComponentProps {
  notifications?: NotificationsStart;
  overviewService?: typeof OverviewService;
}

const Overview: React.FC<OverviewProps> = (props) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext);
  const OverviewViewModelActor = OverviewViewModel(services);
  // @ts-ignore
  const [indices, setIndices] = useState<CatIndex[]>([]);
  const [index, setIndex] = useState<string>(undefined);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<any>({
    pageIndex: 0,
    pageSize: 20,
    pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    totalItemCount: 0,
  });

  const [sorting, setSorting] = useState<any>({
    sort: {
      direction: "desc",
      field: "index",
    },
  });

  const fetchIndices = useCallback(async () => {
    const response = await OverviewViewModelActor.fetchIndices({
      from: pagination.pageIndex * pagination.pageSize,
      size: pagination.pageSize,
      search: search,
      terms: search,
      sortField: sorting.sort.field,
      sortDirection: sorting.sort.direction,
      showDataStreams: true,
    });
    setIndices(response.indices);
    setPagination({
      ...pagination,
      totalItemCount: response.indicesCount,
    });
  }, [OverviewViewModelActor]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.OVERVIEW]);
    fetchIndices();
  }, [sorting, pagination.pageIndex, search]);

  const onChange = (nextValues: CriteriaWithPagination<any>) => {
    setPagination({
      ...pagination,
      pageIndex: nextValues.page.index,
      pageSize: nextValues.page.size,
    });
    setSorting({
      sort: nextValues.sort,
    });
  };

  const onSearchChange = _.debounce(({ query, queryText, error }: ArgsWithQuery | ArgsWithError): void => {
    if (error) {
      return;
    }

    setSearch(queryText);
  }, 500);

  return (
    <ContentPanel bodyStyles={{ padding: "initial" }} title="Overview">
      <IndicesSearch search={search} onSearchChange={onSearchChange} onRefresh={fetchIndices} />
      <IndicesTable
        pagination={pagination}
        sorting={sorting}
        indices={indices}
        filterIsApplied={false}
        loadingIndices={false}
        resetFilters={() => {}}
        onChange={onChange}
      />
    </ContentPanel>
  );
};

export default Overview;
