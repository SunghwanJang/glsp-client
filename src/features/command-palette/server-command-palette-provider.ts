/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { inject, injectable } from "inversify";
import { Action, ICommandPaletteActionProvider, LabeledAction, Point, SModelElement, TYPES } from "sprotty";

import { isSetContextActionsAction, RequestContextActions } from "../../base/actions/context-actions";
import { EditorContextService } from "../../base/editor-context";
import { GLSPActionDispatcher } from "../request-response/glsp-action-dispatcher";

export namespace ServerCommandPalette {
    export const CONTEXT_ID = "command-palette";
    export const TEXT = "text";
    export const INDEX = "index";
}

@injectable()
export class ServerCommandPaletteActionProvider implements ICommandPaletteActionProvider {
    @inject(TYPES.IActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
    @inject(EditorContextService) protected editorContext: EditorContextService;

    getActions(root: Readonly<SModelElement>, text: string, lastMousePosition?: Point, index?: number): Promise<LabeledAction[]> {
        const requestAction = new RequestContextActions(ServerCommandPalette.CONTEXT_ID, this.editorContext.get({
            [ServerCommandPalette.TEXT]: text,
            [ServerCommandPalette.INDEX]: index ? index : 0
        }));
        return this.actionDispatcher.requestUntil(requestAction).then(response => this.getPaletteActionsFromResponse(response));
    }

    getPaletteActionsFromResponse(action: Action): LabeledAction[] {
        if (isSetContextActionsAction(action)) {
            return action.actions;
        }
        return [];
    }
}
