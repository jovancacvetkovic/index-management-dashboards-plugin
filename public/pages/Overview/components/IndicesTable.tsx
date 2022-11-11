import React, { useEffect, useState } from "react";
import { ManagedCatIndex } from "../../../../server/models/interfaces";
import {
  EuiBasicTable,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiTableSelectionType,
  EuiTitle,
} from "@elastic/eui";

export interface IndicesTableProps {
  indices: ManagedCatIndex[];
  onChange?: Function;
  onSelectionChange?: Function;
  pagination?: any;
  sorting?: any;
}

export const IndicesTable: React.FC<IndicesTableProps> = ({
  indices = [],
  onChange = undefined,
  onSelectionChange = undefined,
  pagination = undefined,
  sorting = undefined,
}) => {
  const [item, setItem] = useState<ManagedCatIndex | null>(null);

  useEffect(() => {
    setItem(indices[0]);
  }, [indices]);

  const [selection] = useState<EuiTableSelectionType<ManagedCatIndex>>({
    // @ts-ignore
    onSelectionChange: onSelectionChange,
  });

  const HEALTH_TO_COLOR: {
    [health: string]: string;
    green: string;
    yellow: string;
    red: string;
  } = {
    green: "success",
    yellow: "warning",
    red: "danger",
  };

  const actions = [
    {
      render: (item: ManagedCatIndex) => {
        return (
          <EuiLink onClick={() => setItem(item)} color="success">
            Show details
          </EuiLink>
        );
      },
    },
  ];

  const columns = [
    {
      field: "index",
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
      field: "health",
      name: "Health",
      sortable: true,
      truncateText: true,
      textOnly: true,
      align: "right",
      render: (health: string, item: ManagedCatIndex) => {
        const color = health ? HEALTH_TO_COLOR[health] : "subdued";
        const text = health || item.status;
        return <EuiHealth color={color}>{text}</EuiHealth>;
      },
    },
    {
      name: "Actions",
      actions,
    },
  ];

  // @ts-ignore
  return (
    <EuiFlexGroup style={{ padding: "0px 5px" }} direction="row">
      <EuiFlexItem>
        <EuiPanel grow={true}>
          <EuiBasicTable
            // @ts-ignore
            columns={columns}
            isSelectable={true}
            itemId="index"
            items={indices}
            noItemsMessage={"No indices found"}
            // @ts-ignore
            onChange={onChange}
            pagination={pagination}
            selection={selection}
            sorting={sorting}
          />
        </EuiPanel>
      </EuiFlexItem>
      <EuiFlexItem>
        {item ? (
          <EuiPanel grow={true}>
            <EuiTitle size="s">
              <h3>{item.index}</h3>
            </EuiTitle>

            <EuiHorizontalRule margin="xs" />
            <EuiCodeBlock language="json" fontSize="m" paddingSize="m">
              {JSON.stringify(item, null, 2)}
            </EuiCodeBlock>
          </EuiPanel>
        ) : null}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
