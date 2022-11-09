/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { BREADCRUMBS } from "../../../utils/constants";
import {
  ArgsWithError,
  ArgsWithQuery,
  Direction,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiCopy,
  EuiFlexItem,
  EuiHighlight,
  EuiHorizontalRule,
  EuiSearchBar,
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
  indices: ManagedCatIndex[];
  initialIndices: ManagedCatIndex[];
  loadingIndices: boolean;
  showDataStreams: boolean;
}

interface BoolQuery {
  field: string;
  match: string;
  value: string;
  operator: string;
  type: string;
}

export default class SearchIndices extends Component<IndicesProps, IndicesState> {
  static contextType = CoreServicesContext;
  constructor(props: IndicesProps) {
    super(props);
    const { from, size, search, sortField, sortDirection, showDataStreams } = getURLQueryParams(this.props.location);
    this.state = {
      totalIndices: 0,
      from,
      size: 2,
      search,
      query: Query.parse(search),
      sortField,
      sortDirection,
      indices: [],
      initialIndices: [],
      loadingIndices: true,
      showDataStreams,
    };

    this.getIndices = _.debounce(this.getIndices, 500, { leading: true });
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.SEARCH_INDICES]);
    await this.getIndices();
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = SearchIndices.getQueryObjectFromState(prevState);
    const currQuery = SearchIndices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
  }

  static getQueryObjectFromState({ from, size, search, sortField, sortDirection, showDataStreams }: IndicesState): IndicesQueryParams {
    return { from, size, search, sortField, sortDirection, showDataStreams };
  }

  getIndices = async (): Promise<void> => {
    const { search, from, size, query } = this.state;

    this.setState({ loadingIndices: true });

    const getBoolQueries = (queries: BoolQuery[] = [], search: string = "") => {
      let boolQuery = {} as any;
      queries.forEach((query: BoolQuery) => {
        const {
          field = "name",
          match = "must",
          value = search,
          // type = "field",
          // operator = "eq",
        } = query;

        if (!boolQuery[match]) boolQuery[match] = [];
        boolQuery[match].push({
          match: {
            [field]: {
              query: value,
            },
          },
        });
      });

      return boolQuery;
    };
    try {
      const { indexService, history } = this.props;
      let queryObject: any = {
        query: {
          bool: getBoolQueries(query.ast.clauses, search),
        },
        from,
        size,
      };

      if (_.isEmpty(search)) {
        queryObject = {
          ...queryObject,
          query: {
            match_all: {},
          },
        };
      }

      const queryParamsString = JSON.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getIndicesResponse = await indexService.searchIndices(queryObject);

      if (getIndicesResponse.ok) {
        const { indices, totalIndices } = getIndicesResponse.response;
        this.setState({ indices, totalIndices });
        if (_.isEmpty(this.state.initialIndices)) {
          this.setState({
            initialIndices: indices,
          });
        }
      } else {
        this.context.notifications.toasts.addDanger(getIndicesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices"));
    }

    this.setState({ loadingIndices: false });
  };

  onSearchChange = ({ query, queryText, error }: ArgsWithQuery | ArgsWithError): void => {
    if (error) {
      return;
    }

    this.setState({ from: 0, search: queryText, query });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search, query: Query.parse(DEFAULT_QUERY_PARAMS.search) });
  };

  searchColumnRenderer = (value: string = "") => {
    let { query } = this.state;
    // @ts-ignore
    let clauses = query.ast._clauses;
    const hasMatch = clauses.filter((clause: { value: string }) => value.match(_.trim(clause.value, "*")));

    return <EuiHighlight search={!_.isEmpty(hasMatch) ? value : ""}>{value}</EuiHighlight>;
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
      render: this.searchColumnRenderer,
    },
    {
      field: "_source.lastname",
      name: "Doc field: Lastname",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
      render: this.searchColumnRenderer,
    },
  ];

  onChangePage = ({ page }) =>
    this.setState(
      {
        from: page.index + page.size,
      },
      () => this.getIndices()
    );

  render() {
    const { totalIndices, from, size, search, indices, loadingIndices, initialIndices } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalIndices,
    };

    const schema = {
      strict: true,
      fields: {
        name: {
          type: "string",
        },
        lastname: {
          type: "string",
        },
      },
    };

    /*const filterFn = (field: string, result: IndexType[], ind: IndexType): IndexType => {
      if (ind._source[field]) {
        return result.concat({
          view: ind._source[field],
          value: ind._source[field],
        });
      }

      return result;
    };*/

    /* const getFilters = (field: string): IndexType[] => {
      let names = initialIndices.reduce(filterFn.bind(undefined, field), []);
      names = names.map((item) => [item["value"], item]);
      return [...new Map(names).values()];
    };*/

    /*
    const filters: SearchFilterConfig[] = [
      {
        type: "field_value_selection",
        field: "name",
        name: "Search by Name",
        filterWith: "includes",
        multiSelect: "and",
        options: getFilters("name"),
      },
      {
        type: "field_value_selection",
        field: "lastname",
        name: "Search by lastname",
        filterWith: "includes",
        multiSelect: "and",
        options: getFilters("lastname"),
      },
    ];
*/
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Full text search">
        <EuiFlexItem>
          <EuiSearchBar
            query={search}
            box={{ placeholder: "Enter search term", schema, incremental: false }}
            onChange={this.onSearchChange}
            /*
            filters={filters}
*/
          />
        </EuiFlexItem>

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.getSearchResultColumns()}
          itemId="index"
          items={indices}
          noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={this.resetFilters} />}
          onChange={this.onChangePage}
          pagination={pagination}
        />
      </ContentPanel>
    );
  }
}
