/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OverviewService, ServicesContext } from "../../../services";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { BrowserServices, OnSearchChangeArgs } from "../../../models/interfaces";
import { BREADCRUMBS } from "../../../utils/constants";
import { NotificationsStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../components/core_services";
import { OverviewViewModel } from "../models/OverviewViewModel";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { IndicesTable } from "../components/IndicesTable";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../Indices/utils/constants";
import { CriteriaWithPagination, EuiHorizontalRule, EuiTableSelectionType } from "@elastic/eui";
import { ContentPanel } from "../../../components/ContentPanel";
import { IndicesSearch } from "../components/IndicesSearch";
import _ from "lodash";
import { DocsTable } from "../components/DocsTable";

export interface OverviewProps extends RouteComponentProps {
  notifications?: NotificationsStart;
  overviewService?: typeof OverviewService;
}

// noinspection JSIgnoredPromiseFromCall
const Overview: React.FC<OverviewProps> = (props) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext);

  const OverviewViewModelActor = OverviewViewModel(services);
  const [indices, setIndices] = useState<ManagedCatIndex[]>([]);
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

  const fetchIndices = async () => {
    const response = await OverviewViewModelActor.getIndices({
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
  };

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.OVERVIEW]);

    // noinspection JSIgnoredPromiseFromCall
    fetchIndices();
  }, [sorting, pagination.pageIndex, search]);

  const onTableChange = (nextValues: CriteriaWithPagination<any>) => {
    setPagination({
      ...pagination,
      pageIndex: nextValues.page.index,
      pageSize: nextValues.page.size,
    });
    setSorting({
      sort: nextValues.sort,
    });
  };

  const onSearchChange = _.debounce(({ queryText, error }: OnSearchChangeArgs): void => {
    if (error) {
      return;
    }

    setSearch(queryText);
  }, 500);

  const [selected, setSelected] = useState<EuiTableSelectionType<ManagedCatIndex>[]>([]);
  const onSelectionChange = (selectedItems: EuiTableSelectionType<ManagedCatIndex>[]) => {
    setSelected(selectedItems);
  };

  return (
    <>
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Overview">
        <IndicesSearch search={search} onSearchChange={onSearchChange} onRefresh={fetchIndices} />
        <IndicesTable
          pagination={pagination}
          sorting={sorting}
          indices={indices}
          onChange={onTableChange}
          onSelectionChange={onSelectionChange}
        />
      </ContentPanel>
      <EuiHorizontalRule margin="xs" />
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Search">
        <DocsTable indices={selected} />
      </ContentPanel>
    </>
  );
};

export default Overview;
