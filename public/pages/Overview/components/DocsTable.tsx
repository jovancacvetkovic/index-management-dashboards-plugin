import React, { useContext, useEffect, useState } from "react";
import {
  CriteriaWithPagination,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHighlight,
  EuiSearchBar,
  EuiTableSelectionType,
} from "@elastic/eui";
import { ServicesContext } from "../../../services";
import { BrowserServices, OnSearchChangeArgs } from "../../../models/interfaces";
import { OverviewViewModel } from "../models/OverviewViewModel";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../Indices/utils/constants";

import _ from "lodash";

interface BoolQuery {
  field: string;
  match: string;
  value: string;
  operator: string;
  type: string;
}

interface DocsTableProps {
  indices: EuiTableSelectionType<ManagedCatIndex>[];
}

export const DocsTable: React.FC<DocsTableProps> = ({ indices = [] }) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const OverviewViewModelActor = OverviewViewModel(services);

  const [docs, setDocs] = useState<ManagedCatIndex[]>([]);

  const [query, setQuery] = useState();
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<any>({
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    totalItemCount: 0,
  });

  const [sorting, setSorting] = useState<any>({
    sort: {
      direction: "desc",
      field: "index",
    },
  });

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

  const getQuery = () => {
    let queryObject: any = {
      query: {
        // @ts-ignore
        bool: getBoolQueries(query?.ast?.clauses || [], search),
      },

      // @ts-ignore
      // indices: [...new Set(indices.map(item => item?.index))],
      from: pagination.pageIndex * pagination.pageSize,
      size: pagination.pageSize,

      sort: [
        {
          _index: {
            order: sorting.sort.direction,
          },
        },
      ],
    };

    if (_.isEmpty(search)) {
      queryObject = {
        ...queryObject,
        query: {
          match_all: {},
        },
      };
    }

    return queryObject;
  };

  const getDocs = async () => {
    if (_.isEmpty(search)) {
      setDocs([]);
    } else {
      const queryObject = getQuery();
      const response = await OverviewViewModelActor.searchIndices(queryObject);
      setDocs(response.docs);
      setPagination({
        ...pagination,
        totalItemCount: response.docsCount,
      });
    }
  };

  useEffect(() => {
    if (!_.isEmpty(search)) {
      getDocs();
    } else {
      setDocs([]);
    }
  }, [search, indices, sorting]);

  const onSearchChange = _.debounce(({ query, queryText, error }: OnSearchChangeArgs): void => {
    if (error) {
      return;
    }

    if (_.isEmpty(queryText)) {
      setDocs([]);
    } else {
      setPagination({
        ...pagination,
        pageIndex: 0,
      });
      setQuery(query);
      setSearch(queryText);
    }
  }, 500);

  const searchColumnRenderer = (value: string = "") => {
    // @ts-ignore
    let clauses = query?.ast?._clauses || [];
    const hasMatch = clauses.filter((clause: { value: string }) => value.match(_.trim(clause.value, "*")));

    return <EuiHighlight search={!_.isEmpty(hasMatch) ? value : ""}>{value}</EuiHighlight>;
  };

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

  const columns = [
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
      render: searchColumnRenderer,
    },
    {
      field: "_source.lastname",
      name: "Doc field: Lastname",
      sortable: true,
      truncateText: false,
      textOnly: true,
      width: "250px",
      render: searchColumnRenderer,
    },
  ];

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

  return (
    <EuiFlexGroup style={{ padding: "0px 5px" }}>
      <EuiFlexItem>
        <EuiSearchBar
          query={search}
          box={{
            placeholder: "Enter search term",
            incremental: true,
            schema,
          }}
          onChange={onSearchChange}
        />
        <EuiBasicTable
          columns={columns}
          isSelectable={true}
          itemId="doc"
          items={docs}
          noItemsMessage={"Enter some terms to see the results"}
          onChange={onTableChange}
          pagination={pagination}
          sorting={sorting}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
