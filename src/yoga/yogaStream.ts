import { Observable, Subject } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { yogaHandler } from './yogaHandler';
import { api } from '../rpc';

const $yogaRoot = new Subject();

export const $updatedYogaCoords = new Subject();

export const updateYogaRoot = (root: any) => {
    $yogaRoot.next(root);
};

export const updateYogaNode = (node: any) => {
    if (!node) {
        return;
    }
    updateYogaRoot(node);
};

$yogaRoot
    .pipe(
        delay(0),
        concatMap((instance: any) => {
            return new Observable(subscriber => {
                const handleYogaProps = newProps => {
                    const { children: yogaChildren, nodeBatchId, reactId, ...yogaPropsWithoutChildren } = newProps;

                    subscriber.next({ reactId, props: yogaPropsWithoutChildren });
                    if (yogaChildren) {
                        yogaChildren.forEach(child => {
                            handleYogaProps(child);
                        });
                    }
                };
                api.getTreeForYoga(instance).then(treeForYoga => {
                    const newProps = yogaHandler(treeForYoga);
                    handleYogaProps(newProps);
                    subscriber.complete();
                });
            });
        })
    )
    .subscribe($updatedYogaCoords);
