from torch import nn
import torch
from torch.nn.modules import dropout, linear


class AudioModel(nn.Module):
    def __init__(self):
        super(AudioModel, self).__init__()

        self.net = nn.Sequential(
            # 64
            # 862
            nn.Conv2d(1, 32, kernel_size=3),
            nn.SiLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.BatchNorm2d(32),
            #
            nn.Conv2d(32, 64, kernel_size=3),
            nn.SiLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.BatchNorm2d(64),
            #
            nn.Conv2d(64, 128, kernel_size=3),
            nn.SiLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.BatchNorm2d(128),
            #
            nn.Dropout(0.2),
            nn.Flatten(),
            nn.Linear(128 * 6 * 106, 256),
            nn.SiLU(),
            nn.Linear(256, 2),
            # nn.SiLU(),
            # nn.Linear(64, 2)
        )

    def forward(self, input: torch.Tensor):
        out = self.net(input)

        # print(out.shape)
        # quit()

        return out
