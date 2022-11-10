/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArgsWithError, ArgsWithQuery, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSearchBar } from "@elastic/eui";

interface IndexControlsProps {
  search: string;
  onSearchChange: (args: ArgsWithQuery | ArgsWithError) => void;
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
          onChange={onSearchChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ maxWidth: 250 }}>
        <EuiButtonIcon color={"primary"} display="fill" onClick={onRefresh} iconType="refresh" />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
