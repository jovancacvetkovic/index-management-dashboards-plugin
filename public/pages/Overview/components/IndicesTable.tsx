import React, { useEffect, useState } from "react";
import IndexEmptyPrompt from "../../Indices/components/IndexEmptyPrompt";
import { CatIndex } from "../../../../server/models/interfaces";
import {
  EuiBasicTable,
  EuiCodeBlock,
  EuiDescriptionList,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSelectable,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { indicesColumns } from "../../Indices/utils/constants";

export interface IndicesTableProps {
  indices: CatIndex[];
  filterIsApplied: boolean;
  loadingIndices: boolean;
  resetFilters?: Function;
  onChange?: Function;
  onClick?: Function;
  pagination?: any;
  sorting?: any;
}

export const IndicesTable: React.FC<IndicesTableProps> = ({
  indices = [],
  filterIsApplied = false,
  loadingIndices = false,
  resetFilters = undefined,
  onChange = undefined,
  onClick = undefined,
  pagination = undefined,
  sorting = undefined,
}) => {
  const [options, setOptions] = useState<
    {
      label: string;
    }[]
  >([]);

  const [item, setItem] = useState(undefined);

  const onSelectionChange = (selectedItems) => {
    const options = selectedItems.map((ind) => ({ label: ind.index, data: ind }));
    setOptions(options);
  };
  const [selection, setSelection] = useState({
    onSelectionChange: onSelectionChange,
  });

  // @ts-ignore
  return (
    <>
      <EuiBasicTable
        columns={indicesColumns()}
        isSelectable={true}
        itemId="index"
        items={indices}
        noItemsMessage={<IndexEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingIndices} resetFilters={resetFilters} />}
        onChange={onChange}
        pagination={pagination}
        selection={selection}
        sorting={sorting}
      />
      <EuiSpacer />
      <EuiTitle size="s">
        <h3>Indices description</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="xs" />
      <EuiSplitPanel.Outer direction="row">
        <EuiSplitPanel.Inner>
          <EuiSelectable
            options={options}
            singleSelection={true}
            onChange={(newOptions) => {
              setOptions(newOptions);

              const changedItems = newOptions.filter((itm) => itm.checked === "on");
              if (changedItems && changedItems[0]) {
                setItem(changedItems[0]);
              }
            }}
            listProps={{ bordered: true }}
          >
            {(list) => list}
          </EuiSelectable>
        </EuiSplitPanel.Inner>
        <EuiSplitPanel.Inner color="subdued" grow={true}>
          {item ? (
            <EuiFlexItem>
              <EuiTitle size="s">
                <h3>{item.label} description</h3>
              </EuiTitle>
              <EuiCodeBlock language="json" fontSize="m" paddingSize="m" lineNumbers>
                {JSON.stringify(item.data, null, 2)}
              </EuiCodeBlock>
            </EuiFlexItem>
          ) : null}
        </EuiSplitPanel.Inner>
      </EuiSplitPanel.Outer>
    </>
  );
};
