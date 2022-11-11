/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSearchBar } from "@elastic/eui";
import { OnSearchChangeArgs } from "../../../models/interfaces";

interface IndexControlsProps {
  search: string;
  onSearchChange: (args: OnSearchChangeArgs) => void;
  onRefresh: () => Promise<void>;
}

export const IndicesSearch: React.FC<IndexControlsProps> = ({ search = "", onSearchChange = undefined, onRefresh = undefined }) => {
  const schema = {
    strict: true,
    fields: {
      indices: {
        type: "string",
      },
    },
  };

  return (
    <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiSearchBar
          query={search}
          box={{
            placeholder: "Search the indices...",
            schema,
            incremental: true,
          }}
          // @ts-ignore
          onChange={onSearchChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ maxWidth: 250 }}>
        <EuiButtonIcon color={"primary"} display="fill" onClick={onRefresh} iconType="refresh" />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
