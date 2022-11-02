/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { BREADCRUMBS } from "../../../utils/constants";
import {
  ArgsWithError,
  ArgsWithQuery,
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiCopy,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSearchBar,
  EuiTableSelectionType,
  EuiTableSortingType,
  Pagination,
  Query,
} from "@elastic/eui";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../Indices/utils/constants";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { ContentPanel } from "../../../components/ContentPanel";
import { getURLQueryParams } from "../../Indices/utils/helpers";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import IndexService from "../../../services/IndexService";
import { CoreServicesContext } from "../../../components/core_services";
import { getErrorMessage } from "../../../utils/helpers";
import { IndicesQueryParams } from "../../Indices/models/interfaces";
import IndexEmptyPrompt from "../../Indices/components/IndexEmptyPrompt";

export interface SearchIndicesQueryString {
  query: string;
}

export interface SearchIndicesQuery {
  query_string: SearchIndicesQueryString;
}

export interface SearchIndicesQueryParams {
  query: SearchIndicesQuery;
}
interface IndicesProps extends RouteComponentProps {
  indexService: IndexService;
}

interface IndicesState {
  totalIndices: number;
  from: number;
  size: number;
  search: string;
  query: Query;
  sortField: keyof ManagedCatIndex;
  sortDirection: Direction;
  selectedItems: ManagedCatIndex[];
  indices: ManagedCatIndex[];
  loadingIndices: boolean;
  showDataStreams: boolean;
}

export default class SearchContainer extends Component<IndicesProps, IndicesState> {
  static contextType = CoreServicesContext;
  constructor(props: IndicesProps) {
    super(props);
    const { from, size, search, sortField, sortDirection, showDataStreams } = getURLQueryParams(this.props.location);
    this.state = {
      totalIndices: 0,
      from,
      size,
      search,
      query: Query.parse(search),
      sortField,
      sortDirection,
      selectedItems: [],
      indices: [],
      loadingIndices: true,
      showDataStreams,
    };

    this.getIndices = _.debounce(this.getIndices, 500, { leading: true });
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.SEARCH_INDICES]);
    await this.getIndices();
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection, showDataStreams }: IndicesState): IndicesQueryParams {
    return { from, size, search, sortField, sortDirection, showDataStreams };
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = SearchContainer.getQueryObjectFromState(prevState);
    const currQuery = SearchContainer.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
  }

  getIndices = async (): Promise<void> => {
    const { search } = this.state;
    this.setState({ loadingIndices: true });
    try {
      const { indexService, history } = this.props;
      const queryObject = {
        q: !_.isEmpty(search) ? search : undefined,
      };

      const queryParamsString = JSON.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getIndicesResponse = await indexService.searchIndices(queryObject);

      debugger;
      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        this.setState({ indices, totalIndices });
      } else {
        this.context.notifications.toasts.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }

    // Avoiding flicker by showing/hiding the "Data stream" column only after the results are loaded.
    this.setState({ loadingIndices: false });
  };

  onSearchChange = ({ query, queryText, error }: ArgsWithQuery | ArgsWithError): void => {
    if (error) {
      return;
    }
    debugger;
    this.setState({ from: 0, search: queryText, query });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search, query: Query.parse(DEFAULT_QUERY_PARAMS.search) });
  };

  getSearchResultColumns = () => [
    {
      field: "_index",
      name: "Index",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
      render: (index: string) => {
        return (
          <EuiCopy textToCopy={index}>
            {(copy) => (
              <div>
                <EuiButtonEmpty size="xs" flush="right" iconType="copyClipboard" onClick={copy} color="text"></EuiButtonEmpty>
                <span title={index}>{index}</span>
              </div>
            )}
          </EuiCopy>
        );
      },
    },
    {
      field: "_source.name",
      name: "Doc field: name",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
    },
    {
      field: "_source.lastname",
      name: "Doc field: lastname",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
    },
  ];

  render() {
    const { totalIndices, from, size, search, sortField, sortDirection, indices, loadingIndices } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalIndices,
    };

    const sorting: EuiTableSortingType<ManagedCatIndex> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<ManagedCatIndex> = {
      // onSelectionChange: this.onSelectionChange,
    };
    const schema = {
      strict: true,
      fields: {
        indices: {
          type: "string",
        },
      },
    };
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Full text search">
        <EuiFlexItem>
          <EuiSearchBar
            query={search}
            box={{ placeholder: "Enter search term", schema, incremental: true }}
            onChange={this.onSearchChange}
          />
        </EuiFlexItem>

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.getSearchResultColumns()}
          isSelectable={true}
          itemId="index"
          items={indices}
          noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}
