import math
from torch.utils.data.dataset import Subset
import torch


def get_iterations(dataset: Subset, batch_size: int):
    return math.floor(len(dataset) / batch_size)


def accuracy_mean(y_hat, y) -> torch.Tensor:
    pred = torch.argmax(y_hat, dim=1)
    return (pred == y).float().mean()


def accuracy_sum(y_hat, y) -> torch.Tensor:
    pred = torch.argmax(y_hat, dim=1)
    return (pred == y).sum()


class Accuracy:
    def __init__(self, dataloader_length: int, print=False):
        self.dataloader_length = dataloader_length
        self.loss_list = []
        self.accuracy_list = []
        self.print = print
        self.final_loss = 0
        self.final_accuracy = 0
        self.reset()

    def reset(self):
        self.total_accuracy = 0
        self.total_loss = 0
        self.items_length = 0

    def batch(self, loss: float, outs: torch.Tensor, labels: torch.Tensor):
        self.items_length += labels.size(0)
        self.total_loss += round(loss, 2)
        self.total_accuracy += round(accuracy_sum(outs,
                                     labels).item() * 100, 2)

    def step(self):
        self.final_loss = round(self.total_loss / self.dataloader_length, 2)
        self.final_accuracy = round(self.total_accuracy / self.items_length, 2)

        self.loss_list.append(self.final_loss)
        self.accuracy_list.append(self.final_accuracy)

        if (self.print):
            print(f"Loss: {self.final_loss}, Accuracy: {self.final_accuracy}%")

        self.reset()
